import { VascularNode, VascularEdge, DijkstraResult, DijkstraStep } from '../types/vascular';

/**
 * Calculates the energy traversal cost of an edge in a given direction:
 * Cost = (length / (radius^2)) * penalty
 * - If moving WITH flow_direction: penalty = 1
 * - If moving AGAINST flow_direction: penalty = Math.exp(k * blood_velocity)
 */
export function calculateEdgeCost(
  edge: VascularEdge,
  fromId: string,
  toId: string,
  k: number = 0.5,
  velocityMultiplier: number = 1.0
): { cost: number; penalty: number; isWithFlow: boolean; effectiveVelocity: number } {
  const effectiveVelocity = edge.blood_velocity * velocityMultiplier;
  
  // Determine if moving with or against the blood flow
  let isWithFlow = true;
  if (fromId === edge.source && toId === edge.target) {
    isWithFlow = edge.flow_direction === 'source_to_target';
  } else if (fromId === edge.target && toId === edge.source) {
    isWithFlow = edge.flow_direction === 'target_to_source';
  }

  const penalty = isWithFlow ? 1.0 : Math.exp(k * effectiveVelocity);
  
  // Guard against radius <= 0
  const safeRadius = Math.max(edge.radius, 0.1);
  const cost = (edge.length / (safeRadius * safeRadius)) * penalty;

  return {
    cost,
    penalty,
    isWithFlow,
    effectiveVelocity
  };
}

/**
 * Min Priority Queue for Dijkstra's Algorithm
 */
class MinPriorityQueue<T> {
  private heap: { item: T; priority: number }[] = [];

  push(item: T, priority: number) {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): { item: T; priority: number } | undefined {
    if (this.heap.length === 0) return undefined;
    const min = this.heap[0];
    const end = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = end;
      this.bubbleDown(0);
    }
    return min;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(n: number) {
    const element = this.heap[n];
    while (n > 0) {
      const parentN = Math.floor((n - 1) / 2);
      const parent = this.heap[parentN];
      if (element.priority >= parent.priority) break;
      this.heap[n] = parent;
      this.heap[parentN] = element;
      n = parentN;
    }
  }

  private bubbleDown(n: number) {
    const length = this.heap.length;
    const element = this.heap[n];
    while (true) {
      const leftChildN = 2 * n + 1;
      const rightChildN = 2 * n + 2;
      let swap: number | null = null;
      let minPriority = element.priority;

      if (leftChildN < length) {
        const leftChild = this.heap[leftChildN];
        if (leftChild.priority < minPriority) {
          swap = leftChildN;
          minPriority = leftChild.priority;
        }
      }

      if (rightChildN < length) {
        const rightChild = this.heap[rightChildN];
        if (rightChild.priority < minPriority) {
          swap = rightChildN;
        }
      }

      if (swap === null) break;
      this.heap[n] = this.heap[swap];
      this.heap[swap] = element;
      n = swap;
    }
  }
}

/**
 * Custom Dijkstra's Algorithm for Vascular Navigation
 */
export function runVascularDijkstra(
  nodes: VascularNode[],
  edges: VascularEdge[],
  startId: string,
  targetId: string,
  options: {
    k?: number;
    velocityMultiplier?: number;
    recordSteps?: boolean;
  } = {}
): DijkstraResult {
  const { k = 0.5, velocityMultiplier = 1.0, recordSteps = true } = options;

  // Build adjacency list (bi-directional network graph)
  const adjacency = new Map<string, Array<{ neighborId: string; edge: VascularEdge }>>();
  nodes.forEach(node => adjacency.set(node.id, []));

  edges.forEach(edge => {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);

    adjacency.get(edge.source)!.push({ neighborId: edge.target, edge });
    adjacency.get(edge.target)!.push({ neighborId: edge.source, edge });
  });

  const distances: Record<string, number> = {};
  const previousNode: Record<string, string | null> = {};
  const previousEdge: Record<string, VascularEdge | null> = {};
  const visited = new Set<string>();
  const visitedOrder: string[] = [];
  const steps: DijkstraStep[] = [];

  // Initialize distances
  nodes.forEach(node => {
    distances[node.id] = Infinity;
    previousNode[node.id] = null;
    previousEdge[node.id] = null;
  });

  distances[startId] = 0;

  const pq = new MinPriorityQueue<string>();
  pq.push(startId, 0);

  while (!pq.isEmpty()) {
    const current = pq.pop();
    if (!current) break;

    const u = current.item;
    const currentDist = current.priority;

    if (visited.has(u)) continue;
    visited.add(u);
    visitedOrder.push(u);

    if (recordSteps) {
      steps.push({
        currentNodeId: u,
        visitedNodes: Array.from(visited),
        distances: { ...distances },
        previous: { ...previousNode }
      });
    }

    // Stop early if target node reached
    if (u === targetId) {
      break;
    }

    // Relax neighbors
    const neighbors = adjacency.get(u) || [];
    for (const { neighborId: v, edge } of neighbors) {
      if (visited.has(v)) continue;

      const { cost, penalty } = calculateEdgeCost(edge, u, v, k, velocityMultiplier);
      const newDist = currentDist + cost;

      if (newDist < distances[v]) {
        distances[v] = newDist;
        previousNode[v] = u;
        previousEdge[v] = edge;
        pq.push(v, newDist);

        if (recordSteps) {
          steps.push({
            currentNodeId: u,
            visitedNodes: Array.from(visited),
            distances: { ...distances },
            previous: { ...previousNode },
            evaluatedEdge: {
              source: u,
              target: v,
              cost,
              penalty
            }
          });
        }
      }
    }
  }

  // Reconstruct path from targetId back to startId
  const path: string[] = [];
  const traversedEdges: VascularEdge[] = [];
  let curr: string | null = targetId;

  if (distances[targetId] !== Infinity) {
    while (curr !== null) {
      path.unshift(curr);
      const prevEdge = previousEdge[curr];
      if (prevEdge) {
        traversedEdges.unshift(prevEdge);
      }
      curr = previousNode[curr];
    }
  }

  // Total physical distance along the chosen path
  const totalDistance = traversedEdges.reduce((sum, e) => sum + e.length, 0);
  const totalCost = distances[targetId] === Infinity ? 0 : distances[targetId];

  return {
    path,
    edges: traversedEdges,
    totalCost,
    totalDistance,
    steps,
    visitedOrder,
    distances
  };
}
