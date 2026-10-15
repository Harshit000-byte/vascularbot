export type NodeType = 'artery' | 'vein' | 'tumor' | 'injection_site';

export interface VascularNode {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  label?: string;
  depth?: number; // for layered or anatomical visualization
}

export type FlowDirection = 'source_to_target' | 'target_to_source';

export interface VascularEdge {
  id?: string;
  source: string;
  target: string;
  length: number;          // in micrometers or arbitrary length units
  radius: number;          // in micrometers or vessel caliber units
  blood_velocity: number;  // in cm/s or vessel flow velocity units
  flow_direction: FlowDirection;
  type?: 'artery' | 'vein'; // whether this vessel segment is arterial (red) or venous (blue)
  name?: string;
}

export interface DijkstraStep {
  currentNodeId: string;
  visitedNodes: string[];
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  evaluatedEdge?: {
    source: string;
    target: string;
    cost: number;
    penalty: number;
  };
}

export interface DijkstraResult {
  path: string[];            // list of node IDs from start to target
  edges: VascularEdge[];      // ordered list of edges traversed
  totalCost: number;          // Total energy cost (nanojoules / arbitrary units)
  totalDistance: number;      // Total Euclidean or vessel length
  steps: DijkstraStep[];      // Step-by-step history for visualization
  visitedOrder: string[];     // order of node evaluations
  distances: Record<string, number>; // final computed distances
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  isHeartbeatActive: boolean;
  heartbeatMultiplier: number; // velocity multiplier during pulse (e.g. 2.5x)
  kConstant: number;           // constant for penalty = exp(k * v)
  currentEnergyDepleted: number;
  totalPathEnergy: number;
  progressPercent: number;     // 0 - 100% of nanobot journey
  nanobotPosition: { x: number; y: number; angle: number } | null;
  currentNodeIndex: number;
  startNodeId: string;
  targetNodeId: string;
  simulationSpeed: number;     // 0.5x, 1x, 2x, etc.
}

export interface VascularNetwork {
  id: string;
  name: string;
  description: string;
  nodes: VascularNode[];
  edges: VascularEdge[];
  defaultStartId: string;
  defaultTargetId: string;
}
