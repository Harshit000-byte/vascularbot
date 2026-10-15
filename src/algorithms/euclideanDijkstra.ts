import { VascularNode, VascularEdge, DijkstraResult } from '../types/vascular';
import { calculateEdgeCost } from './dijkstra';

/**
 * Standard Dijkstra based purely on physical vessel length:
 * Cost = length (ignoring blood velocity, flow direction, and vessel radius)
 */
export function runEuclideanDijkstra(
  nodes: VascularNode[],
  edges: VascularEdge[],
  startId: string,
  targetId: string
): DijkstraResult & { energyCostOnThisPath: number } {
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

  nodes.forEach(node => {
    distances[node.id] = Infinity;
    previousNode[node.id] = null;
    previousEdge[node.id] = null;
  });

  distances[startId] = 0;

  // Simple priority queue or min array search
  const unvisited = new Set(nodes.map(n => n.id));

  while (unvisited.size > 0) {
    let u: string | null = null;
    let minDist = Infinity;
    for (const node of unvisited) {
      if (distances[node] < minDist) {
        minDist = distances[node];
        u = node;
      }
    }

    if (u === null || minDist === Infinity) break;
    unvisited.delete(u);
    visited.add(u);

    if (u === targetId) break;

    const neighbors = adjacency.get(u) || [];
    for (const { neighborId: v, edge } of neighbors) {
      if (visited.has(v)) continue;

      const weight = edge.length; // Pure physical distance
      const alt = distances[u] + weight;

      if (alt < distances[v]) {
        distances[v] = alt;
        previousNode[v] = u;
        previousEdge[v] = edge;
      }
    }
  }

  // Reconstruct path
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

  // Calculate actual energy cost if bot took this physical path!
  let energyCostOnThisPath = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    const edge = traversedEdges[i];
    if (edge) {
      const { cost } = calculateEdgeCost(edge, from, to);
      energyCostOnThisPath += cost;
    }
  }

  return {
    path,
    edges: traversedEdges,
    totalCost: distances[targetId] === Infinity ? 0 : distances[targetId],
    totalDistance: distances[targetId] === Infinity ? 0 : distances[targetId],
    energyCostOnThisPath,
    steps: [],
    visitedOrder: Array.from(visited),
    distances
  };
}
