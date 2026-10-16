'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { VascularNode, VascularEdge, DijkstraResult, NodeType } from '../types/vascular';
import { calculateEdgeCost } from '../algorithms/dijkstra';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
  Layers,
  Crosshair,
  Info,
  ShieldAlert,
  ArrowRight,
  Heart
} from 'lucide-react';
import { HeartModelSVG } from './HeartModelSVG';

interface VascularCanvasProps {
  networkId?: string;
  nodes: VascularNode[];
  edges: VascularEdge[];
  dijkstraResult: DijkstraResult;
  nanobotPos: { x: number; y: number; angle: number } | null;
  startNodeId: string;
  targetNodeId: string;
  isHeartbeatActive: boolean;
  velocityMultiplier: number;
  kConstant: number;
  selectedNodeId: string | null;
  selectedEdge: VascularEdge | null;
  onSelectNode: (nodeId: string) => void;
  onSelectEdge: (edge: VascularEdge | null) => void;
  onSetStartNode?: (nodeId: string) => void;
  onSetTargetNode?: (nodeId: string) => void;
}

interface Particle {
  edgeIndex: number;
  t: number; // 0 to 1 along edge
  speed: number;
  size: number;
  color: string;
}

export const VascularCanvas: React.FC<VascularCanvasProps> = ({
  networkId,
  nodes,
  edges,
  dijkstraResult,
  nanobotPos,
  startNodeId,
  targetNodeId,
  isHeartbeatActive,
  velocityMultiplier,
  kConstant,
  selectedNodeId,
  selectedEdge,
  onSelectNode,
  onSelectEdge,
  onSetStartNode,
  onSetTargetNode
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pan and Zoom transform
  const [transform, setTransform] = useState({ x: 40, y: 30, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Floating tooltip state
  const [hoveredNode, setHoveredNode] = useState<VascularNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<{
    edge: VascularEdge;
    costForward: number;
    costBackward: number;
    x: number;
    y: number;
  } | null>(null);

  // Real Heart Model State
  const isHeartNetwork = useMemo(() => {
    return !networkId || networkId === 'cardiac_coronary' || networkId === 'coronary';
  }, [networkId]);
  const [showHeartModel, setShowHeartModel] = useState(true);
  const [heartModelOpacity, setHeartModelOpacity] = useState(0.88);

  // Toggles
  const [showBloodParticles, setShowBloodParticles] = useState(true);
  const [showVesselLabels, setShowVesselLabels] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Heartbeat pulse wave ring effect
  const [pulseRipples, setPulseRipples] = useState<{ x: number; y: number; r: number; opacity: number }[]>([]);

  // Fast node lookup
  const nodeMap = useMemo(() => {
    const map = new Map<string, VascularNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  // Set of edge keys in the optimal Dijkstra path
  const pathEdgeKeys = useMemo(() => {
    const set = new Set<string>();
    const path = dijkstraResult.path;
    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];
      set.add(`${u}--${v}`);
      set.add(`${v}--${u}`);
    }
    return set;
  }, [dijkstraResult.path]);

  // Initialize blood particles flowing in each vessel
  const particlesRef = useRef<Particle[]>([]);
  useEffect(() => {
    const particles: Particle[] = [];
    edges.forEach((edge, idx) => {
      // Create 2-4 particles per vessel
      const count = Math.max(2, Math.min(5, Math.round(edge.length / 40)));
      const isArtery = edge.type !== 'vein';
      for (let i = 0; i < count; i++) {
        particles.push({
          edgeIndex: idx,
          t: Math.random(),
          speed: (0.15 + Math.random() * 0.1) * (edge.blood_velocity / 10),
          size: 1.5 + Math.random() * 1.5,
          color: isArtery ? 'rgba(254, 202, 202, 0.85)' : 'rgba(191, 219, 254, 0.85)'
        });
      }
    });
    particlesRef.current = particles;
  }, [edges]);

  // Trigger pulse ripple animation when heartbeat spikes
  useEffect(() => {
    if (isHeartbeatActive) {
      const startNode = nodeMap.get(startNodeId);
      if (startNode) {
        setPulseRipples(prev => [
          ...prev,
          { x: startNode.x, y: startNode.y, r: 10, opacity: 1.0 }
        ]);
      }
    }
  }, [isHeartbeatActive, startNodeId, nodeMap]);

  // Reset view to fit all nodes or focus heart
  const handleResetView = useCallback(() => {
    if (nodes.length === 0 || !containerRef.current) return;
    const { clientWidth: w, clientHeight: h } = containerRef.current;
    
    if (isHeartNetwork) {
      // Prominently center and enlarge the anatomical heart model
      const targetHeartWidth = 460;
      const targetHeartHeight = 500;
      const scale = Math.min((w - 40) / targetHeartWidth, (h - 40) / targetHeartHeight, 1.95);
      const chosenScale = Math.max(scale, 1.35);
      const offsetX = w / 2 - 445 * chosenScale;
      const offsetY = h / 2 - 340 * chosenScale;
      setTransform({ x: offsetX, y: offsetY, k: chosenScale });
      return;
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach(n => {
      minX = Math.min(minX, n.x);
      maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y);
      maxY = Math.max(maxY, n.y);
    });

    const netWidth = maxX - minX + 160;
    const netHeight = maxY - minY + 160;
    const scale = Math.min(w / netWidth, h / netHeight, 1.4);
    const offsetX = (w - (maxX + minX) * scale) / 2;
    const offsetY = (h - (maxY + minY) * scale) / 2;

    setTransform({ x: offsetX, y: offsetY, k: scale });
  }, [nodes, isHeartNetwork]);

  // Auto center on initial mount or network load
  useEffect(() => {
    handleResetView();
    const t = setTimeout(handleResetView, 80);
    return () => clearTimeout(t);
  }, [handleResetView]);

  // Zoom handlers
  const handleZoom = (delta: number) => {
    setTransform(prev => ({
      ...prev,
      k: Math.max(0.4, Math.min(3.0, prev.k * (delta > 0 ? 1.2 : 0.83)))
    }));
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform(prev => {
      const newK = Math.max(0.35, Math.min(3.5, prev.k * factor));
      // Zoom toward cursor position
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { ...prev, k: newK };
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const newX = mouseX - (mouseX - prev.x) * (newK / prev.k);
      const newY = mouseY - (mouseY - prev.y) * (newK / prev.k);
      return { x: newX, y: newY, k: newK };
    });
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
      return;
    }

    // Hit testing for hover
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.x) / transform.k;
    const mouseY = (e.clientY - rect.top - transform.y) / transform.k;

    // Check nodes (radius ~ 18)
    let foundNode: VascularNode | null = null;
    for (const node of nodes) {
      const d = Math.hypot(node.x - mouseX, node.y - mouseY);
      if (d <= 20) {
        foundNode = node;
        break;
      }
    }
    setHoveredNode(foundNode);

    // If no node hovered, check edges
    if (!foundNode) {
      let foundEdge: { edge: VascularEdge; costForward: number; costBackward: number; x: number; y: number } | null = null;
      for (const edge of edges) {
        const u = nodeMap.get(edge.source);
        const v = nodeMap.get(edge.target);
        if (!u || !v) continue;

        // Point to segment distance
        const dx = v.x - u.x;
        const dy = v.y - u.y;
        const l2 = dx * dx + dy * dy;
        let t = ((mouseX - u.x) * dx + (mouseY - u.y) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        const projX = u.x + t * dx;
        const projY = u.y + t * dy;
        const dist = Math.hypot(mouseX - projX, mouseY - projY);

        if (dist <= Math.max(edge.radius + 6, 10)) {
          const forward = calculateEdgeCost(edge, edge.source, edge.target, kConstant, velocityMultiplier);
          const backward = calculateEdgeCost(edge, edge.target, edge.source, kConstant, velocityMultiplier);
          foundEdge = {
            edge,
            costForward: forward.cost,
            costBackward: backward.cost,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          };
          break;
        }
      }
      setHoveredEdge(foundEdge);
    } else {
      setHoveredEdge(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Node or Edge click selection
  const handleClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - transform.x) / transform.k;
    const mouseY = (e.clientY - rect.top - transform.y) / transform.k;

    // Check if clicked a node
    for (const node of nodes) {
      const d = Math.hypot(node.x - mouseX, node.y - mouseY);
      if (d <= 20) {
        onSelectNode(node.id);
        onSelectEdge(null);
        return;
      }
    }

    // Check if clicked an edge
    for (const edge of edges) {
      const u = nodeMap.get(edge.source);
      const v = nodeMap.get(edge.target);
      if (!u || !v) continue;

      const dx = v.x - u.x;
      const dy = v.y - u.y;
      const l2 = dx * dx + dy * dy;
      let t = ((mouseX - u.x) * dx + (mouseY - u.y) * dy) / l2;
      t = Math.max(0, Math.min(1, t));
      const projX = u.x + t * dx;
      const projY = u.y + t * dy;
      const dist = Math.hypot(mouseX - projX, mouseY - projY);

      if (dist <= Math.max(edge.radius + 6, 10)) {
        onSelectEdge(edge);
        return;
      }
    }

    // Clicked empty space
    onSelectEdge(null);
  };

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const dt = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      // Handle canvas resize & high DPI
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = parent.clientWidth;
        const displayHeight = parent.clientHeight;

        if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
          canvas.width = displayWidth * dpr;
          canvas.height = displayHeight * dpr;
          canvas.style.width = `${displayWidth}px`;
          canvas.style.height = `${displayHeight}px`;
        }

        ctx.resetTransform();
        ctx.scale(dpr, dpr);
      }

      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      // Deep dark biological lumen background
      if (isHeartNetwork && showHeartModel) {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, width, height);
      }

      // Draw subtle microvascular grid background
      ctx.save();
      ctx.strokeStyle = (isHeartNetwork && showHeartModel) ? 'rgba(30, 41, 59, 0.25)' : 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 0.5;
      const gridSize = 40 * transform.k;
      const startX = transform.x % gridSize;
      const startY = transform.y % gridSize;
      ctx.beginPath();
      for (let x = startX; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = startY; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
      ctx.restore();

      // Apply Pan & Zoom Transform
      ctx.save();
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Heartbeat pulse wave ripples
      pulseRipples.forEach((ripple, idx) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${ripple.opacity * 0.7})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();

        ripple.r += dt * 380;
        ripple.opacity -= dt * 1.2;
      });

      // Filter dead ripples
      setPulseRipples(prev => prev.filter(r => r.opacity > 0));

      // 1. Draw all blood vessels (edges)
      edges.forEach((edge) => {
        const u = nodeMap.get(edge.source);
        const v = nodeMap.get(edge.target);
        if (!u || !v) return;

        const isArtery = edge.type !== 'vein';
        const isSelected = selectedEdge === edge;
        const edgeKey = `${edge.source}--${edge.target}`;
        const isOptimalPath = pathEdgeKeys.has(edgeKey);

        // Vessel width based on radius
        const vesselWidth = Math.max(3, edge.radius * 1.8);

        // Outer Vessel Wall (Tunica Adventitia)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.lineWidth = vesselWidth + 3.5;
        ctx.lineCap = 'round';
        ctx.strokeStyle = isArtery
          ? 'rgba(127, 29, 29, 0.45)'
          : 'rgba(30, 58, 138, 0.45)';
        ctx.stroke();

        // Inner Vessel Lumen (Artery Red / Vein Blue)
        ctx.beginPath();
        ctx.moveTo(u.x, u.y);
        ctx.lineTo(v.x, v.y);
        ctx.lineWidth = vesselWidth;
        ctx.lineCap = 'round';

        // Heartbeat pulsing expansion
        const pulseEffect = isHeartbeatActive ? 1.15 : 1.0;
        ctx.lineWidth = vesselWidth * pulseEffect;

        if (isArtery) {
          ctx.strokeStyle = isHeartbeatActive
            ? '#ff3344' // glowing bright arterial red on pulse
            : '#dc2626'; // arterial red
        } else {
          ctx.strokeStyle = '#2563eb'; // venous blue
        }
        ctx.stroke();

        // Selected edge highlight ring
        if (isSelected) {
          ctx.beginPath();
          ctx.moveTo(u.x, u.y);
          ctx.lineTo(v.x, v.y);
          ctx.lineWidth = vesselWidth + 5;
          ctx.strokeStyle = '#f59e0b';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 10;
          ctx.stroke();
        }

        // Draw Flow Direction Chevron Arrows along vessel
        const dx = v.x - u.x;
        const dy = v.y - u.y;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        const midX = (u.x + v.x) / 2;
        const midY = (u.y + v.y) / 2;

        // Reverse arrow direction if flow is target_to_source
        const arrowAngle = edge.flow_direction === 'target_to_source' ? angle + Math.PI : angle;

        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(arrowAngle);
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.lineTo(2, 0);
        ctx.lineTo(-6, 4);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();

        // Clear anatomical labels for major arterial branches
        const isMajorVessel = edge.name && (
          edge.name.includes('LAD') ||
          edge.name.includes('LCx') ||
          edge.name.includes('RCA') ||
          edge.name.includes('Aortic') ||
          edge.name.includes('LMCA') ||
          edge.name.includes('Diagonal') ||
          edge.name.includes('Perforator') ||
          edge.name.includes('Marginal')
        );

        if (showVesselLabels || (isHeartNetwork && isMajorVessel)) {
          ctx.save();
          const labelText = edge.name
            ? edge.name.replace(' Segment', '').replace('First ', '').replace('Second ', '')
            : `r:${edge.radius} v:${edge.blood_velocity}`;

          ctx.font = 'bold 9.5px monospace';
          const textMetrics = ctx.measureText(labelText);
          const bgWidth = textMetrics.width + 10;
          const bgHeight = 15;

          // High-contrast translucent badge background
          ctx.fillStyle = isArtery ? 'rgba(15, 23, 42, 0.92)' : 'rgba(15, 23, 42, 0.92)';
          ctx.strokeStyle = isArtery ? 'rgba(244, 63, 94, 0.85)' : 'rgba(59, 130, 246, 0.85)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(midX - bgWidth / 2, midY - bgHeight - 4, bgWidth, bgHeight, 4);
          ctx.fill();
          ctx.stroke();

          // Flow indicator dot
          ctx.beginPath();
          ctx.arc(midX - bgWidth / 2 + 5, midY - bgHeight / 2 - 4, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = isArtery ? '#ef4444' : '#3b82f6';
          ctx.fill();

          ctx.fillStyle = isArtery ? '#fecdd3' : '#bfdbfe';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, midX + 3, midY - bgHeight / 2 - 4);
          ctx.restore();
        }

        ctx.restore();
      });

      // 2. Draw blood flow micro-particles (erythrocytes)
      if (showBloodParticles && particlesRef.current.length > 0) {
        ctx.save();
        const velocityScale = isHeartbeatActive ? velocityMultiplier : 1.0;

        particlesRef.current.forEach(p => {
          const edge = edges[p.edgeIndex];
          if (!edge) return;
          const u = nodeMap.get(edge.source);
          const v = nodeMap.get(edge.target);
          if (!u || !v) return;

          // Advance particle along flow direction
          p.t += dt * p.speed * velocityScale;
          if (p.t > 1.0) p.t = 0;

          // Flow direction: 0->1 or 1->0
          const actualT = edge.flow_direction === 'source_to_target' ? p.t : 1 - p.t;
          const px = u.x + (v.x - u.x) * actualT;
          const py = u.y + (v.y - u.y) * actualT;

          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        });
        ctx.restore();
      }

      // 3. Draw NEON GREEN glowing Dijkstra optimal path
      if (dijkstraResult.path.length >= 2) {
        const path = dijkstraResult.path;

        // Multi-pass neon green glow
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer neon aura
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
          const node = nodeMap.get(path[i]);
          if (!node) continue;
          if (i === 0) ctx.moveTo(node.x, node.y);
          else ctx.lineTo(node.x, node.y);
        }
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.lineWidth = 14;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 24;
        ctx.stroke();

        // Middle neon glow
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
          const node = nodeMap.get(path[i]);
          if (!node) continue;
          if (i === 0) ctx.moveTo(node.x, node.y);
          else ctx.lineTo(node.x, node.y);
        }
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Inner bright white-green laser core
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
          const node = nodeMap.get(path[i]);
          if (!node) continue;
          if (i === 0) ctx.moveTo(node.x, node.y);
          else ctx.lineTo(node.x, node.y);
        }
        ctx.strokeStyle = '#e0fdf4';
        ctx.lineWidth = 2.0;
        ctx.shadowBlur = 0;
        ctx.stroke();

        // Traveling neon pulses along the path
        const pulseTime = (now / 1000) * 1.5;
        const totalSegments = path.length - 1;
        for (let pIdx = 0; pIdx < 3; pIdx++) {
          const cycleOffset = (pulseTime + (pIdx / 3) * totalSegments) % totalSegments;
          const segIdx = Math.floor(cycleOffset);
          const segT = cycleOffset - segIdx;
          const uNode = nodeMap.get(path[segIdx]);
          const vNode = nodeMap.get(path[segIdx + 1]);
          if (uNode && vNode) {
            const posX = uNode.x + (vNode.x - uNode.x) * segT;
            const posY = uNode.y + (vNode.y - uNode.y) * segT;
            ctx.beginPath();
            ctx.arc(posX, posY, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#86efac';
            ctx.shadowBlur = 15;
            ctx.fill();
          }
        }

        ctx.restore();
      }

      // 4. Draw Nodes
      nodes.forEach(node => {
        const isStart = node.id === startNodeId;
        const isTarget = node.id === targetNodeId;
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNode?.id === node.id;
        const isInOptimalPath = dijkstraResult.path.includes(node.id);

        ctx.save();

        if (isTarget || node.type === 'tumor') {
          // TUMOR NODE: Organic malignant mass with pulsing lobes
          const pulse = Math.sin(now / 200) * 2;
          const baseRadius = 18 + pulse;

          // Tumor outer hypoxic aura
          ctx.beginPath();
          ctx.arc(node.x, node.y, baseRadius + 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
          ctx.shadowColor = '#dc2626';
          ctx.shadowBlur = 16;
          ctx.fill();

          // Organic malignant lobes
          ctx.fillStyle = '#991b1b';
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            const lobeX = node.x + Math.cos(a + now / 1000) * (baseRadius * 0.7);
            const lobeY = node.y + Math.sin(a + now / 1000) * (baseRadius * 0.7);
            ctx.beginPath();
            ctx.arc(lobeX, lobeY, 7, 0, Math.PI * 2);
            ctx.fill();
          }

          // Core necrotic nucleus
          ctx.beginPath();
          ctx.arc(node.x, node.y, baseRadius * 0.75, 0, Math.PI * 2);
          ctx.fillStyle = '#7f1d1d';
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fill();

          // Center crosshair / target indicator
          ctx.fillStyle = '#fca5a5';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('TUMOR', node.x, node.y);

        } else if (isStart || node.type === 'injection_site') {
          // INJECTION SITE: High-tech vascular port with rotating radar rings
          const ringRadius = 16;

          // Radar sweep ring
          ctx.beginPath();
          ctx.arc(node.x, node.y, ringRadius + 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Port Core
          ctx.beginPath();
          ctx.arc(node.x, node.y, ringRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#0e7490';
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.fill();

          ctx.fillStyle = '#ecfeff';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('ENTRY', node.x, node.y);

        } else {
          // Standard Artery or Vein Bifurcation Node
          const isArtery = node.type === 'artery';
          const nodeRadius = isInOptimalPath ? 9 : 7.5;

          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = isArtery ? '#ef4444' : '#3b82f6';
          ctx.strokeStyle = isInOptimalPath ? '#4ade80' : 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = isInOptimalPath ? 2.5 : 1.5;

          if (isInOptimalPath) {
            ctx.shadowColor = '#22c55e';
            ctx.shadowBlur = 8;
          }
          ctx.fill();
          ctx.stroke();
        }

        // Selected / Hover ring
        if (isSelected || isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 22, 0, Math.PI * 2);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Only draw node labels for key endpoints or when explicitly toggled or hovered
        const isKeyNode = isStart || isTarget || node.type === 'injection_site' || node.type === 'tumor';
        const shouldShowLabel = isHovered || isSelected || isKeyNode || showVesselLabels;

        if (node.label && shouldShowLabel) {
          ctx.save();
          const labelText = node.label;
          ctx.font = isKeyNode ? 'bold 11px monospace' : '9.5px monospace';
          const textMetrics = ctx.measureText(labelText);
          const bgW = textMetrics.width + 10;
          const bgH = isKeyNode ? 18 : 14;

          // Draw dark frosted background pill for legibility
          ctx.fillStyle = isStart
            ? 'rgba(4, 47, 46, 0.92)'
            : isTarget
            ? 'rgba(76, 5, 25, 0.92)'
            : 'rgba(15, 23, 42, 0.88)';
          ctx.strokeStyle = isStart
            ? '#14b8a6'
            : isTarget
            ? '#f43f5e'
            : isInOptimalPath
            ? '#10b981'
            : 'rgba(148, 163, 184, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(node.x - bgW / 2, node.y + (isKeyNode ? 18 : 14), bgW, bgH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isStart
            ? '#5eead4'
            : isTarget
            ? '#fda4af'
            : isInOptimalPath
            ? '#6ee7b7'
            : '#e2e8f0';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, node.x, node.y + (isKeyNode ? 18 : 14) + bgH / 2);
          ctx.restore();
        }

        ctx.restore();
      });

      // 5. Draw Medical Nanobot ("VascularBot-9000")
      if (nanobotPos) {
        ctx.save();
        ctx.translate(nanobotPos.x, nanobotPos.y);
        ctx.rotate(nanobotPos.angle);

        // Nanobot thruster exhaust trail
        ctx.beginPath();
        ctx.moveTo(-12, -4);
        ctx.lineTo(-20 - Math.random() * 8, 0);
        ctx.lineTo(-12, 4);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fill();

        // Nanobot capsule fuselage
        ctx.beginPath();
        // Oval capsule
        ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.stroke();

        // Nanobot cockpit sensor dome (glows neon cyan)
        ctx.beginPath();
        ctx.arc(4, 0, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fill();

        // Directional forward radar beam
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(26, -9);
        ctx.lineTo(26, 9);
        ctx.closePath();
        ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    nodes,
    edges,
    dijkstraResult,
    nanobotPos,
    startNodeId,
    targetNodeId,
    isHeartbeatActive,
    velocityMultiplier,
    kConstant,
    selectedNodeId,
    selectedEdge,
    hoveredNode,
    transform,
    pulseRipples,
    nodeMap,
    pathEdgeKeys,
    showBloodParticles,
    showVesselLabels,
    isHeartNetwork,
    showHeartModel
  ]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#060a12] overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      {/* Real Heart Anatomy Model Layer (Rendered Behind Canvas Vessels) */}
      {showHeartModel && isHeartNetwork && (
        <div
          className="absolute top-0 left-0 pointer-events-none origin-top-left z-0 select-none"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
            width: 900,
            height: 650,
            opacity: heartModelOpacity,
            transition: isDragging ? 'none' : 'opacity 0.25s ease'
          }}
        >
          <HeartModelSVG
            width={900}
            height={650}
            isHeartbeatActive={isHeartbeatActive}
            showLabels={true}
          />
        </div>
      )}

      <canvas ref={canvasRef} className="block w-full h-full relative z-[1]" />

      {/* Floating Canvas HUD Overlay: Status & Controls */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">CANVAS (70%):</span>
          <span className="text-slate-400">
            {isHeartNetwork ? 'Cardiac Coronary Anatomy (Real Heart Model)' : 'Vascular Bio-Network'}
          </span>
        </div>

        {isHeartbeatActive && (
          <div className="flex items-center gap-2 bg-rose-950/90 text-rose-300 border border-rose-500/60 px-3 py-1.5 rounded-lg shadow-lg text-xs font-semibold animate-bounce">
            <Activity className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>SYSTOLIC SURGE ({velocityMultiplier}x Velocity)</span>
          </div>
        )}
      </div>

      {/* Top Right Tool Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-700/60 shadow-lg">
        {isHeartNetwork && (
          <button
            onClick={() => setShowHeartModel(!showHeartModel)}
            title={showHeartModel ? 'Hide Real Heart Model Anatomy' : 'Show Real Heart Model Anatomy'}
            className={`p-1.5 rounded transition-colors flex items-center gap-1.5 px-2 text-xs font-medium ${
              showHeartModel
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${showHeartModel ? 'text-rose-400 fill-rose-500/40 animate-pulse' : ''}`} />
            <span className="hidden sm:inline font-mono">Heart Model</span>
          </button>
        )}
        <div className="w-px h-4 bg-slate-700 my-auto mx-0.5" />
        <button
          onClick={() => handleZoom(1)}
          title="Zoom In"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          title="Zoom Out"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset View"
          className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-700 my-auto mx-0.5" />
        <button
          onClick={() => setShowBloodParticles(!showBloodParticles)}
          title="Toggle Blood Flow Particles"
          className={`p-1.5 rounded transition-colors ${showBloodParticles ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Activity className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowVesselLabels(!showVesselLabels)}
          title="Toggle Vessel Metrics"
          className={`p-1.5 rounded transition-colors ${showVesselLabels ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Layers className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowLegend(!showLegend)}
          title="Toggle Legend"
          className={`p-1.5 rounded transition-colors ${showLegend ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:bg-slate-800'}`}
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 shadow-xl text-xs text-slate-300 pointer-events-auto max-w-xs z-10">
          <div className="font-semibold text-slate-100 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              Hemodynamic Legend
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Dijkstra Nav</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
            {isHeartNetwork && showHeartModel && (
              <div className="flex items-center gap-2 col-span-2 pb-1 border-b border-slate-800/80">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/40" />
                <span className="text-rose-300 font-medium">Real Heart Anatomy (Chambers & Sulci)</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-red-600 shadow-[0_0_6px_#dc2626]" />
              <span>Artery (High Velocity)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-1.5 rounded-full bg-blue-600 shadow-[0_0_6px_#2563eb]" />
              <span>Vein (Low Velocity)</span>
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <span className="w-4 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
              <span className="text-emerald-400 font-medium">Optimal Dijkstra Path (Neon)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-cyan-300" />
              <span>Injection Site</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-700 ring-2 ring-rose-500 animate-pulse" />
              <span>Target Tumor</span>
            </div>

            {isHeartNetwork && (
              <div className="col-span-2 mt-2 pt-1.5 border-t border-slate-800/80 space-y-1 text-[10.5px]">
                <div className="text-cyan-300 font-bold tracking-wider uppercase flex items-center gap-1">
                  <span>Coronary Inflow / Flow Routes:</span>
                </div>
                <div className="text-slate-300">
                  <strong className="text-rose-400">LAD:</strong> Descends anterior interventricular groove &rarr; Apex
                </div>
                <div className="text-slate-300">
                  <strong className="text-rose-400">LCx:</strong> Wraps lateral left groove &rarr; Tumor Feeders
                </div>
                <div className="text-slate-300">
                  <strong className="text-rose-400">RCA:</strong> Descends right AV groove &rarr; PDA
                </div>
              </div>
            )}
          </div>
          <p className="mt-2 text-[10px] text-slate-400 border-t border-slate-800 pt-1.5 leading-relaxed">
            Move WITH flow = 1x penalty. Move AGAINST flow = e^(k &middot; v) penalty.
          </p>
        </div>
      )}

      {/* Floating Hover Tooltip */}
      {hoveredNode && (
        <div className="absolute top-16 left-4 bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-cyan-500/50 shadow-xl text-xs text-slate-200 pointer-events-none z-20 max-w-xs animate-in fade-in">
          <div className="font-bold text-cyan-300 mb-1">{hoveredNode.label || hoveredNode.id}</div>
          <div className="text-[11px] text-slate-300 space-y-0.5">
            <div>Type: <span className="capitalize font-semibold text-white">{hoveredNode.type.replace('_', ' ')}</span></div>
            <div>Coordinates: <span className="font-mono text-slate-400">({hoveredNode.x}, {hoveredNode.y})</span></div>
            {onSetStartNode && hoveredNode.id !== startNodeId && (
              <div className="text-[10px] text-cyan-400 mt-1 italic">Click or select in sidebar to set as Start</div>
            )}
          </div>
        </div>
      )}

      {hoveredEdge && (
        <div
          className="absolute bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-amber-500/50 shadow-xl text-xs text-slate-200 pointer-events-none z-20 max-w-xs -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredEdge.x, top: hoveredEdge.y - 10 }}
        >
          <div className="font-bold text-amber-300 mb-1 flex items-center justify-between">
            <span>{hoveredEdge.edge.name || 'Vessel Segment'}</span>
            <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-300">
              {hoveredEdge.edge.type || 'vessel'}
            </span>
          </div>
          <div className="text-[11px] space-y-1 text-slate-300">
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Radius (r):</span>
              <span className="font-mono font-medium text-white">{hoveredEdge.edge.radius} &mu;m</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Length (L):</span>
              <span className="font-mono font-medium text-white">{hoveredEdge.edge.length} &mu;m</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Velocity (v):</span>
              <span className="font-mono font-medium text-cyan-300">
                {(hoveredEdge.edge.blood_velocity * velocityMultiplier).toFixed(1)} cm/s
              </span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-slate-400">Flow Direction:</span>
              <span className="font-mono text-xs text-emerald-400">
                {hoveredEdge.edge.flow_direction === 'source_to_target' ? 'Source &rarr; Target' : 'Target &rarr; Source'}
              </span>
            </div>
            <div className="border-t border-slate-700/60 pt-1 mt-1 text-[10px] text-slate-400">
              <div>Forward Cost: <span className="font-mono text-emerald-300 font-semibold">{hoveredEdge.costForward.toFixed(2)} nJ</span></div>
              <div>Reverse Cost: <span className="font-mono text-rose-300 font-semibold">{hoveredEdge.costBackward.toFixed(2)} nJ</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
