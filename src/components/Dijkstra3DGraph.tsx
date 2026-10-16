'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Line, OrbitControls, Stars, Text } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Group, Shape, SRGBColorSpace, TextureLoader } from 'three';
import { HeartModelSVG } from './HeartModelSVG';
import { DijkstraResult, DijkstraStep, VascularEdge, VascularNode } from '../types/vascular';

interface Dijkstra3DGraphProps {
  nodes: VascularNode[];
  edges: VascularEdge[];
  result: DijkstraResult;
  step: DijkstraStep | undefined;
  startNodeId: string;
  targetNodeId: string;
  isHeartbeatActive: boolean;
  selectedNodeId: string | null;
  nanobotPos: { x: number; y: number; angle: number } | null;
  onSelectNode: (nodeId: string) => void;
}

const shortId = (id: string) => id.replace(/^(node_|cor_|hep_|cc_|teach_)/, '').replaceAll('_', ' ');

function createHeartSilhouette() {
  const shape = new Shape();
  shape.moveTo(0, -2.35);
  shape.bezierCurveTo(-0.55, -1.9, -2.08, -0.52, -2.08, 0.72);
  shape.bezierCurveTo(-2.08, 1.78, -1.44, 2.38, -0.78, 2.34);
  shape.bezierCurveTo(-0.38, 2.32, -0.12, 1.83, 0, 1.52);
  shape.bezierCurveTo(0.18, 1.91, 0.46, 2.36, 1.05, 2.32);
  shape.bezierCurveTo(2.07, 2.24, 2.38, 1.18, 1.94, 0.1);
  shape.bezierCurveTo(1.46, -1.13, 0.46, -2.02, 0, -2.35);
  return shape;
}

function HeartAnatomy({ isHeartbeatActive, scale }: { isHeartbeatActive: boolean; scale: number }) {
  const heartRef = useRef<Group>(null);
  const silhouette = useMemo(() => createHeartSilhouette(), []);
  const svgMarkup = useMemo(
    () => renderToStaticMarkup(
      <HeartModelSVG width={900} height={650} isHeartbeatActive={isHeartbeatActive} showLabels />
    ),
    [isHeartbeatActive]
  );
  const svgDataUrl = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`,
    [svgMarkup]
  );
  const loadedTexture = useLoader(TextureLoader, svgDataUrl);
  const texture = useMemo(() => {
    const configuredTexture = loadedTexture.clone();
    configuredTexture.colorSpace = SRGBColorSpace;
    configuredTexture.anisotropy = 8;
    configuredTexture.needsUpdate = true;
    return configuredTexture;
  }, [loadedTexture]);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(({ clock }) => {
    if (!heartRef.current) return;
    const beatPhase = clock.elapsedTime % 1.1;
    const beat = isHeartbeatActive
      ? Math.exp(-Math.pow((beatPhase - 0.15) / 0.085, 2))
      : 0.18 * Math.max(0, Math.sin(clock.elapsedTime * 2.8));
    const pulseScale = 1 + beat * 0.014;
    heartRef.current.scale.set(pulseScale, pulseScale, 1);
  });

  return (
    <group ref={heartRef}>
      <mesh position={[-0.08, -0.04, -1.1]} castShadow receiveShadow>
        <extrudeGeometry args={[silhouette, {
          depth: 0.72,
          steps: 1,
          bevelEnabled: true,
          bevelSegments: 5,
          bevelSize: 0.12,
          bevelThickness: 0.15
        }]} />
        <meshStandardMaterial color="#782536" emissive="#270d18" emissiveIntensity={0.3} roughness={0.42} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, -0.22]}>
        <planeGeometry args={[900 * scale, 650 * scale]} />
        <meshBasicMaterial map={texture} transparent opacity={0.97} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GraphScene({ nodes, edges, result, step, startNodeId, targetNodeId, isHeartbeatActive, selectedNodeId, nanobotPos, onSelectNode }: Dijkstra3DGraphProps) {
  const isCardiacNetwork = nodes.some(node => node.id.startsWith('cc_'));
  const isClassroomNetwork = nodes.some(node => node.id.startsWith('teach_'));
  const cardiacScale = 12 / 900;
  const layout = useMemo(() => {
    if (!nodes.length) return new Map<string, [number, number, number]>();
    if (nodes.some(node => node.id.startsWith('cc_'))) {
      return new Map(nodes.map(node => {
        const x = (node.x - 450) * cardiacScale;
        const y = -(node.y - 325) * cardiacScale;
        const dome = Math.exp(-((x / 2.05) ** 2 + (y / 2.8) ** 2));
        return [node.id, [x, y, 0.12 + dome * 0.3] as [number, number, number]];
      }));
    }
    const minX = Math.min(...nodes.map(node => node.x));
    const maxX = Math.max(...nodes.map(node => node.x));
    const minY = Math.min(...nodes.map(node => node.y));
    const maxY = Math.max(...nodes.map(node => node.y));
    const width = Math.max(1, maxX - minX);
    const height = Math.max(1, maxY - minY);
    const scale = 9 / Math.max(width, height);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return new Map(nodes.map((node, index) => [
      node.id,
      [
        (node.x - centerX) * scale,
        0.12 + Math.sin(index * 1.71) * 0.23,
        -(node.y - centerY) * scale
      ] as [number, number, number]
    ]));
  }, [nodes, cardiacScale]);

  const visited = new Set(step?.visitedNodes ?? []);
  const finalPathEdges = useMemo(() => {
    return new Set(result.path.slice(1).map((nodeId, index) => `${result.path[index]}:${nodeId}`));
  }, [result.path]);
  const showFinalPath = step?.phase === 'complete';

  const settledTreeEdges = useMemo(() => {
    if (!step) return new Set<string>();
    const visitedInStep = new Set(step.visitedNodes);
    return new Set(Object.entries(step.previous)
      .filter(([nodeId, parentId]) => parentId && visitedInStep.has(nodeId))
      .map(([nodeId, parentId]) => `${parentId}:${nodeId}`));
  }, [step]);

  const activeEdge = step?.evaluatedEdge;
  const botPosition = nanobotPos
    ? (() => {
        if (isCardiacNetwork) {
          const x = (nanobotPos.x - 450) * cardiacScale;
          const y = -(nanobotPos.y - 325) * cardiacScale;
          const dome = Math.exp(-((x / 2.05) ** 2 + (y / 2.8) ** 2));
          return [x, y, 0.2 + dome * 0.3] as [number, number, number];
        }
        const xs = nodes.map(node => node.x);
        const ys = nodes.map(node => node.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const scale = 9 / Math.max(1, maxX - minX, maxY - minY);
        return [
          (nanobotPos.x - (minX + maxX) / 2) * scale,
          0.42,
          -(nanobotPos.y - (minY + maxY) / 2) * scale
        ] as [number, number, number];
      })()
    : null;

  return (
    <>
      <color attach="background" args={['#07101b']} />
      <fog attach="fog" args={['#07101b', 13, 25]} />
      <ambientLight intensity={1.15} />
      <pointLight position={[4, 7, 4]} intensity={38} color="#79d7ff" />
      <pointLight position={[-5, 2, -5]} intensity={24} color="#4ce1b6" />
      <Stars radius={28} depth={35} count={500} factor={1.8} saturation={0.15} fade speed={0.35} />
      {!isCardiacNetwork && <gridHelper args={[24, 24, '#244052', '#142536']} position={[0, -0.19, 0]} />}
      {isCardiacNetwork && <HeartAnatomy isHeartbeatActive={isHeartbeatActive} scale={cardiacScale} />}

      {edges.map((edge, index) => {
        const from = layout.get(edge.source);
        const to = layout.get(edge.target);
        if (!from || !to) return null;
        const edgeId = `${edge.source}:${edge.target}`;
        const reverseId = `${edge.target}:${edge.source}`;
        const isActive = activeEdge?.source === edge.source && activeEdge?.target === edge.target
          || activeEdge?.source === edge.target && activeEdge?.target === edge.source;
        const isFinalPath = showFinalPath && (finalPathEdges.has(edgeId) || finalPathEdges.has(reverseId));
        const isTreeEdge = settledTreeEdges.has(edgeId) || settledTreeEdges.has(reverseId);
        const edgeColor = isActive ? '#ffd080' : isFinalPath ? '#75f3c4' : isTreeEdge ? '#55cbb1' : edge.type === 'vein' ? '#477bb5' : '#9b5465';
        const midpoint: [number, number, number] = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 + 0.04, (from[2] + to[2]) / 2];
        const control: [number, number, number] = [midpoint[0], midpoint[1] + 0.12, midpoint[2]];

        return (
          <group key={edge.id ?? `${edge.source}-${edge.target}-${index}`}>
            <Line
              points={[from, control, to]}
              color={edgeColor}
              lineWidth={isActive ? 4 : isFinalPath ? 3.4 : isTreeEdge ? 2.1 : 1.1}
              transparent
              opacity={isActive || isFinalPath || isTreeEdge ? 0.95 : 0.55}
            />
            {isClassroomNetwork && (
              <Text
                position={[midpoint[0], midpoint[1] + 0.2, midpoint[2]]}
                fontSize={0.14}
                color="#ffe6a8"
                outlineWidth={0.012}
                outlineColor="#07101b"
                anchorX="center"
                anchorY="middle"
              >
                {edge.length.toFixed(0)}
              </Text>
            )}
            {(isActive || isFinalPath) && (
              <mesh position={midpoint}>
                <sphereGeometry args={[isActive ? 0.055 : 0.04, 12, 12]} />
                <meshBasicMaterial color={edgeColor} />
              </mesh>
            )}
          </group>
        );
      })}

      {nodes.map(node => {
        const position = layout.get(node.id);
        if (!position) return null;
        const distance = step?.distances[node.id] ?? (node.id === startNodeId ? 0 : Infinity);
        const isVisited = visited.has(node.id);
        const isCurrent = step?.currentNodeId === node.id;
        const isStart = node.id === startNodeId;
        const isTarget = node.id === targetNodeId;
        const isSelected = selectedNodeId === node.id;
        const color = isTarget ? '#fb7185' : isCurrent ? '#f9b85c' : isStart ? '#64d7ff' : isVisited ? '#56d7b2' : Number.isFinite(distance) ? '#80a8ff' : '#66778d';
        const radius = isStart || isTarget ? 0.17 : isCurrent ? 0.16 : 0.12;

        return (
          <group key={node.id}>
            <mesh position={position} onClick={event => { event.stopPropagation(); onSelectNode(node.id); }}>
              <sphereGeometry args={[radius, 24, 24]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={isCurrent || isSelected ? 1.4 : 0.55} roughness={0.28} metalness={0.15} />
            </mesh>
            {(isCurrent || isSelected || isStart || isTarget) && (
              <mesh position={[position[0], position[1] - 0.05, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius + 0.06, radius + 0.075, 40]} />
                <meshBasicMaterial color={color} transparent opacity={0.7} />
              </mesh>
            )}
            <Text
              position={[position[0], position[1] + 0.25, position[2]]}
              fontSize={0.105}
              color={isCurrent ? '#ffd397' : '#c4d7df'}
              outlineWidth={0.007}
              outlineColor="#07101b"
              anchorX="center"
              anchorY="middle"
            >
              {`${shortId(node.id)}  ${Number.isFinite(distance) ? distance.toFixed(1) : '∞'}`}
            </Text>
          </group>
        );
      })}

      {botPosition && (
        <group position={botPosition}>
          <mesh>
            <octahedronGeometry args={[0.11, 1]} />
            <meshStandardMaterial color="#fff2b0" emissive="#ffae43" emissiveIntensity={2.4} metalness={0.3} roughness={0.2} />
          </mesh>
          <pointLight intensity={4} distance={1.5} color="#ffb84e" />
        </group>
      )}

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={5} maxDistance={18} minPolarAngle={0.15} maxPolarAngle={isCardiacNetwork ? Math.PI - 0.15 : Math.PI / 2.05} />
    </>
  );
}

export function Dijkstra3DGraph(props: Dijkstra3DGraphProps) {
  const isCardiacNetwork = props.nodes.some(node => node.id.startsWith('cc_'));
  return (
    <div className="graph3d-canvas">
      <Canvas key={isCardiacNetwork ? 'cardiac-scene' : 'network-scene'} camera={isCardiacNetwork ? { position: [0, 0, 15], fov: 35 } : { position: [0, 7.2, 10.5], fov: 43 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: false }}>
        <GraphScene {...props} />
      </Canvas>
      <div className="graph3d-legend">
        {isCardiacNetwork && <span><i className="legend-heart" />CORONARY BED</span>}
        <span><i className="legend-start" />SOURCE</span>
        <span><i className="legend-visited" />SETTLED</span>
        <span><i className="legend-frontier" />FRONTIER</span>
        <span><i className="legend-target" />TARGET</span>
      </div>
      <div className="graph3d-hint">DRAG TO ORBIT <b>·</b> SCROLL TO ZOOM {isCardiacNetwork && <><b>·</b> ANATOMICAL CORONARY ROUTES</>}</div>
      <div className="graph3d-counter">{props.nodes.length} NODES <span>／</span> {props.edges.length} EDGES</div>
    </div>
  );
}
