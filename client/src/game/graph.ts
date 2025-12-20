import type { Graph, GraphNode, Edge } from "../types.ts";

export function initNode(id: number, row: number, col: number): GraphNode {
  return { id, row, col, neighbors: [], player: undefined };
}

export function initGraph(): Graph {
  const nodes = [];
  for (let r = 0; r < 24; r++) {
    for (let c = 0; c < 24; c++) {
      const id = r * 24 + c;
      nodes.push(initNode(id, r, c));
    }
  }

  nodes.push(initNode(576, -1, -1)); // top node
  nodes.push(initNode(577, -1, -1)); // bot node
  nodes.push(initNode(578, -1, -1)); // left node
  nodes.push(initNode(579, -1, -1)); // right node

  // connect top row to top node
  for (let i = 0; i < 24; i++) {
    nodes[i].neighbors.push(576);
  }

  // connect bottom row to bottom bode
  for (let i = 0; i < 24; i++) {
    nodes[575 - i].neighbors.push(577);
  }

  // connect left most column to left node
  for (let i = 0; i < 24; i++) {
    nodes[i * 24].neighbors.push(578);
  }

  // connect right most column to right node
  for (let i = 0; i < 24; i++) {
    nodes[(i + 1) * 24 - 1].neighbors.push(579);
  }

  return nodes;
}

export function addEdgeToGraph(
  graph: Graph,
  nodeA: GraphNode,
  nodeB: GraphNode
): Graph {
  const newGraph = graph.map((node) => {
    if (node.id === nodeA.id) {
      return { ...node, neighbors: [...node.neighbors, nodeB.id] };
    } else if (node.id === nodeB.id) {
      return { ...node, neighbors: [...node.neighbors, nodeA.id] };
    }
    return node;
  });

  return newGraph;
}

export function addEdgesToGraph(edges: Edge[], graph: Graph): Graph {
  for (const edge of edges) {
    const nodeA = edge.nodeA;
    const nodeB = edge.nodeB;

    graph[nodeA.id].neighbors.push(nodeB.id);
    graph[nodeB.id].neighbors.push(nodeA.id);
  }

  const newGraph = graph.map((node) => {
    return { ...node };
  });

  console.log(newGraph);

  return newGraph;
}
