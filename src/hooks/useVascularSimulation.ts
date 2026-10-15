import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VascularNetwork, VascularNode, VascularEdge, DijkstraResult, SimulationState } from '../types/vascular';
import { runVascularDijkstra, calculateEdgeCost } from '../algorithms/dijkstra';
import { runEuclideanDijkstra } from '../algorithms/euclideanDijkstra';
import { PRESET_NETWORKS } from '../data/networks';
import confetti from 'canvas-confetti';

interface UseVascularSimulationProps {
  initialNetwork?: VascularNetwork;
  onHeartbeatSound?: () => void;
  onRecalculateSound?: () => void;
  onSuccessSound?: () => void;
  onStepSound?: () => void;
}

export function useVascularSimulation({
  initialNetwork = PRESET_NETWORKS[0],
  onHeartbeatSound,
  onRecalculateSound,
  onSuccessSound,
  onStepSound
}: UseVascularSimulationProps = {}) {
  const [network, setNetwork] = useState<VascularNetwork>(initialNetwork);
  const [startNodeId, setStartNodeId] = useState<string>(initialNetwork.defaultStartId);
  const [targetNodeId, setTargetNodeId] = useState<string>(initialNetwork.defaultTargetId);

  // Simulation settings
  const [kConstant, setKConstant] = useState<number>(0.5);
  const [isHeartbeatActive, setIsHeartbeatActive] = useState<boolean>(false);
  const [heartbeatMultiplier, setHeartbeatMultiplier] = useState<number>(2.5);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // 1x
  const [autoHeartbeatInterval, setAutoHeartbeatInterval] = useState<boolean>(false);

  // Bot Navigation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasReachedTarget, setHasReachedTarget] = useState<boolean>(false);
  
  // Real-time animation position
  const [currentPathIndex, setCurrentPathIndex] = useState<number>(0);
  const [edgeProgress, setEdgeProgress] = useState<number>(0); // 0.0 to 1.0 along current edge
  const [accumulatedEnergy, setAccumulatedEnergy] = useState<number>(0);
  const [nanobotPos, setNanobotPos] = useState<{ x: number; y: number; angle: number } | null>(null);

  // Selected node / edge for inspection
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<VascularEdge | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<VascularEdge | null>(null);

  // Path history to detect changes
  const prevPathRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Current multiplier based on heartbeat
  const currentVelocityMultiplier = isHeartbeatActive ? heartbeatMultiplier : 1.0;

  // Run Hemodynamic Dijkstra
  const dijkstraResult = useMemo<DijkstraResult>(() => {
    return runVascularDijkstra(
      network.nodes,
      network.edges,
      startNodeId,
      targetNodeId,
      {
        k: kConstant,
        velocityMultiplier: currentVelocityMultiplier,
        recordSteps: true
      }
    );
  }, [network.nodes, network.edges, startNodeId, targetNodeId, kConstant, currentVelocityMultiplier]);

  // Baseline Euclidean Dijkstra for comparison
  const baselineResult = useMemo(() => {
    return runEuclideanDijkstra(network.nodes, network.edges, startNodeId, targetNodeId);
  }, [network.nodes, network.edges, startNodeId, targetNodeId]);

  // Notify when path changes dynamically due to pulse
  useEffect(() => {
    const newPathStr = dijkstraResult.path.join('->');
    const oldPathStr = prevPathRef.current.join('->');
    if (oldPathStr && newPathStr !== oldPathStr) {
      if (onRecalculateSound) onRecalculateSound();
    }
    prevPathRef.current = dijkstraResult.path;
  }, [dijkstraResult.path, onRecalculateSound]);

  // Node lookup map
  const nodeMap = useMemo(() => {
    const map = new Map<string, VascularNode>();
    network.nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [network.nodes]);

  // Reset simulation
  const resetSimulation = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setHasReachedTarget(false);
    setCurrentPathIndex(0);
    setEdgeProgress(0);
    setAccumulatedEnergy(0);

    const startNode = nodeMap.get(startNodeId);
    if (startNode) {
      setNanobotPos({ x: startNode.x, y: startNode.y, angle: 0 });
    }
  }, [startNodeId, nodeMap]);

  // Switch network
  const handleSelectNetwork = useCallback((newNet: VascularNetwork) => {
    setNetwork(newNet);
    setStartNodeId(newNet.defaultStartId);
    setTargetNodeId(newNet.defaultTargetId);
    setIsRunning(false);
    setIsPaused(false);
    setHasReachedTarget(false);
    setCurrentPathIndex(0);
    setEdgeProgress(0);
    setAccumulatedEnergy(0);
    setSelectedNodeId(null);
    setSelectedEdge(null);

    const start = newNet.nodes.find(n => n.id === newNet.defaultStartId);
    if (start) {
      setNanobotPos({ x: start.x, y: start.y, angle: 0 });
    }
  }, []);

  // Update initial nanobot pos on startNode or network change
  useEffect(() => {
    if (!isRunning) {
      const startNode = nodeMap.get(startNodeId);
      if (startNode) {
        setNanobotPos({ x: startNode.x, y: startNode.y, angle: 0 });
      }
    }
  }, [startNodeId, nodeMap, isRunning]);

  // Heartbeat pulse toggle
  const toggleHeartbeat = useCallback(() => {
    setIsHeartbeatActive(prev => {
      const next = !prev;
      if (next && onHeartbeatSound) {
        onHeartbeatSound();
      }
      return next;
    });
  }, [onHeartbeatSound]);

  // Auto heartbeat interval timer (optional rhythmic pulse)
  useEffect(() => {
    if (!autoHeartbeatInterval) return;

    const interval = setInterval(() => {
      setIsHeartbeatActive(true);
      if (onHeartbeatSound) onHeartbeatSound();

      setTimeout(() => {
        setIsHeartbeatActive(false);
      }, 750);
    }, 2200);

    return () => clearInterval(interval);
  }, [autoHeartbeatInterval, onHeartbeatSound]);

  // Start / Pause / Resume
  const startSimulation = useCallback(() => {
    if (hasReachedTarget) {
      resetSimulation();
      setIsRunning(true);
      setIsPaused(false);
      return;
    }
    if (isPaused) {
      setIsPaused(false);
      setIsRunning(true);
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
  }, [hasReachedTarget, isPaused, resetSimulation]);

  const pauseSimulation = useCallback(() => {
    setIsPaused(true);
  }, []);

  // Animation Loop for Nanobot smooth navigation
  useEffect(() => {
    if (!isRunning || isPaused || hasReachedTarget) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const path = dijkstraResult.path;
    if (path.length < 2) return;

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Base traversal speed along edge
      const speedMultiplier = simulationSpeed;
      const progressDelta = deltaTime * 0.7 * speedMultiplier;

      setEdgeProgress(prevProgress => {
        const nextProgress = prevProgress + progressDelta;

        if (nextProgress >= 1.0) {
          // Reached end of current edge
          setCurrentPathIndex(prevIdx => {
            const nextIdx = prevIdx + 1;

            // Completed previous edge: add exact edge cost
            const uId = path[prevIdx];
            const vId = path[nextIdx];
            const edge = network.edges.find(
              e => (e.source === uId && e.target === vId) || (e.source === vId && e.target === uId)
            );
            if (edge) {
              const { cost } = calculateEdgeCost(edge, uId, vId, kConstant, currentVelocityMultiplier);
              setAccumulatedEnergy(acc => acc + cost);
            }

            if (onStepSound) onStepSound();

            if (nextIdx >= path.length - 1) {
              // Reached Tumor Target!
              setHasReachedTarget(true);
              setIsRunning(false);

              if (onSuccessSound) onSuccessSound();
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 }
              });

              return prevIdx;
            }

            return nextIdx;
          });

          return 0; // Reset progress for the next edge
        }

        return nextProgress;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    isRunning,
    isPaused,
    hasReachedTarget,
    dijkstraResult.path,
    network.edges,
    kConstant,
    currentVelocityMultiplier,
    simulationSpeed,
    onStepSound,
    onSuccessSound
  ]);

  // Compute exact live interpolated (x, y) coordinates & angle for the Nanobot
  useEffect(() => {
    const path = dijkstraResult.path;
    if (path.length === 0) return;

    if (currentPathIndex >= path.length - 1) {
      const lastNode = nodeMap.get(path[path.length - 1]);
      if (lastNode) {
        setNanobotPos({ x: lastNode.x, y: lastNode.y, angle: 0 });
      }
      return;
    }

    const uNode = nodeMap.get(path[currentPathIndex]);
    const vNode = nodeMap.get(path[currentPathIndex + 1]);

    if (!uNode || !vNode) return;

    const t = Math.min(Math.max(edgeProgress, 0), 1);
    const currX = uNode.x + (vNode.x - uNode.x) * t;
    const currY = uNode.y + (vNode.y - uNode.y) * t;
    const angle = Math.atan2(vNode.y - uNode.y, vNode.x - uNode.x);

    setNanobotPos({ x: currX, y: currY, angle });
  }, [currentPathIndex, edgeProgress, dijkstraResult.path, nodeMap]);

  // Live Energy Depleted calculation
  const liveEnergyDepleted = useMemo(() => {
    if (!isRunning && currentPathIndex === 0 && edgeProgress === 0) {
      return 0;
    }
    const path = dijkstraResult.path;
    if (currentPathIndex < path.length - 1) {
      const uId = path[currentPathIndex];
      const vId = path[currentPathIndex + 1];
      const edge = network.edges.find(
        e => (e.source === uId && e.target === vId) || (e.source === vId && e.target === uId)
      );
      if (edge) {
        const { cost } = calculateEdgeCost(edge, uId, vId, kConstant, currentVelocityMultiplier);
        return accumulatedEnergy + cost * edgeProgress;
      }
    }
    return accumulatedEnergy;
  }, [
    accumulatedEnergy,
    currentPathIndex,
    edgeProgress,
    dijkstraResult.path,
    network.edges,
    kConstant,
    currentVelocityMultiplier,
    isRunning
  ]);

  // Percentage of journey completed
  const progressPercent = useMemo(() => {
    const totalSegments = Math.max(1, dijkstraResult.path.length - 1);
    if (hasReachedTarget) return 100;
    const current = (currentPathIndex + edgeProgress) / totalSegments;
    return Math.min(100, Math.round(current * 100));
  }, [currentPathIndex, edgeProgress, dijkstraResult.path.length, hasReachedTarget]);

  return {
    network,
    setNetwork,
    startNodeId,
    setStartNodeId,
    targetNodeId,
    setTargetNodeId,
    kConstant,
    setKConstant,
    isHeartbeatActive,
    toggleHeartbeat,
    heartbeatMultiplier,
    setHeartbeatMultiplier,
    autoHeartbeatInterval,
    setAutoHeartbeatInterval,
    simulationSpeed,
    setSimulationSpeed,
    isRunning,
    isPaused,
    hasReachedTarget,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    dijkstraResult,
    baselineResult,
    nanobotPos,
    liveEnergyDepleted,
    progressPercent,
    currentPathIndex,
    edgeProgress,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdge,
    setSelectedEdge,
    hoveredNodeId,
    setHoveredNodeId,
    hoveredEdge,
    setHoveredEdge,
    handleSelectNetwork
  };
}
