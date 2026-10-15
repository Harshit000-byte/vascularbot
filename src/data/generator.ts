import { VascularNetwork, VascularNode, VascularEdge } from '../types/vascular';

/**
 * Procedurally generates a randomized branching vascular network
 * from an injection site (left) to a tumor (right) with arteries and veins.
 */
export function generateProceduralNetwork(
  layers: number = 4,
  nodesPerLayer: number = 3
): VascularNetwork {
  const nodes: VascularNode[] = [];
  const edges: VascularEdge[] = [];

  const canvasWidth = 900;
  const canvasHeight = 600;
  const paddingX = 80;
  const paddingY = 80;

  // Injection site
  const startNode: VascularNode = {
    id: 'gen_start',
    x: paddingX,
    y: canvasHeight / 2,
    type: 'injection_site',
    label: 'Catheter Inflow Port',
    depth: 0
  };
  nodes.push(startNode);

  // Generate intermediate layers
  const layerNodes: VascularNode[][] = [];
  const xStep = (canvasWidth - paddingX * 2) / (layers + 1);

  for (let l = 1; l <= layers; l++) {
    const layerArr: VascularNode[] = [];
    const count = nodesPerLayer + Math.floor(Math.random() * 2);
    const yStep = (canvasHeight - paddingY * 2) / (count + 1);

    for (let i = 1; i <= count; i++) {
      const isArtery = Math.random() > 0.4;
      const jitterX = (Math.random() - 0.5) * 35;
      const jitterY = (Math.random() - 0.5) * 25;

      const node: VascularNode = {
        id: `gen_L${l}_N${i}`,
        x: Math.round(paddingX + l * xStep + jitterX),
        y: Math.round(paddingY + i * yStep + jitterY),
        type: isArtery ? 'artery' : 'vein',
        label: `${isArtery ? 'Arteriole' : 'Venule'} L${l}-${i}`,
        depth: l
      };
      nodes.push(node);
      layerArr.push(node);
    }
    layerNodes.push(layerArr);
  }

  // Tumor site (Target)
  const tumorNode: VascularNode = {
    id: 'gen_tumor',
    x: canvasWidth - paddingX,
    y: canvasHeight / 2 + (Math.random() - 0.5) * 60,
    type: 'tumor',
    label: 'Target Neoplasm',
    depth: layers + 1
  };
  nodes.push(tumorNode);

  // Connect start to first layer
  layerNodes[0].forEach((node) => {
    const dist = Math.hypot(node.x - startNode.x, node.y - startNode.y);
    const radius = 6.0 + Math.random() * 2.5;
    const velocity = 12.0 + Math.random() * 6.0;
    edges.push({
      source: startNode.id,
      target: node.id,
      length: Math.round(dist),
      radius: Number(radius.toFixed(1)),
      blood_velocity: Number(velocity.toFixed(1)),
      flow_direction: 'source_to_target',
      type: 'artery'
    });
  });

  // Connect between layers
  for (let l = 0; l < layers - 1; l++) {
    const currentLayer = layerNodes[l];
    const nextLayer = layerNodes[l + 1];

    currentLayer.forEach(u => {
      // Connect to 1-3 nodes in next layer
      const sortedNext = [...nextLayer].sort((a, b) => 
        Math.hypot(a.x - u.x, a.y - u.y) - Math.hypot(b.x - u.x, b.y - u.y)
      );

      const connectCount = Math.min(sortedNext.length, 1 + Math.floor(Math.random() * 2));
      for (let i = 0; i < connectCount; i++) {
        const v = sortedNext[i];
        const dist = Math.hypot(v.x - u.x, v.y - u.y);
        const isArtery = u.type === 'artery';
        const radius = Math.max(1.5, (6 - l * 0.9) + (Math.random() - 0.5) * 1.5);
        const velocity = Math.max(2.5, (14 - l * 2.2) + (Math.random() - 0.5) * 4);
        
        // 20% of edges have counter-current flow!
        const reverseFlow = Math.random() < 0.22;

        edges.push({
          source: u.id,
          target: v.id,
          length: Math.round(dist),
          radius: Number(radius.toFixed(1)),
          blood_velocity: Number(velocity.toFixed(1)),
          flow_direction: reverseFlow ? 'target_to_source' : 'source_to_target',
          type: isArtery ? 'artery' : 'vein'
        });
      }
    });

    // Cross-links within the same layer (shunts/anastomoses)
    for (let i = 0; i < currentLayer.length - 1; i++) {
      if (Math.random() < 0.35) {
        const u = currentLayer[i];
        const v = currentLayer[i + 1];
        const dist = Math.hypot(v.x - u.x, v.y - u.y);
        edges.push({
          source: u.id,
          target: v.id,
          length: Math.round(dist),
          radius: Number((2.0 + Math.random() * 1.5).toFixed(1)),
          blood_velocity: Number((4.0 + Math.random() * 3).toFixed(1)),
          flow_direction: Math.random() > 0.5 ? 'source_to_target' : 'target_to_source',
          type: 'vein'
        });
      }
    }
  }

  // Connect last layer to tumor
  const lastLayer = layerNodes[layers - 1];
  lastLayer.forEach(node => {
    const dist = Math.hypot(tumorNode.x - node.x, tumorNode.y - node.y);
    const radius = 2.5 + Math.random() * 1.5;
    const velocity = 4.0 + Math.random() * 3.0;
    edges.push({
      source: node.id,
      target: tumorNode.id,
      length: Math.round(dist),
      radius: Number(radius.toFixed(1)),
      blood_velocity: Number(velocity.toFixed(1)),
      flow_direction: 'source_to_target',
      type: node.type === 'artery' ? 'artery' : 'vein'
    });
  });

  return {
    id: `procedural_${Date.now()}`,
    name: 'Procedural Angio-Architecture',
    description: `Synthetically generated ${nodes.length}-node vascular plexus with variable vessel calibers.`,
    nodes,
    edges,
    defaultStartId: startNode.id,
    defaultTargetId: tumorNode.id
  };
}
