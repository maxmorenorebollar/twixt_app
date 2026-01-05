export interface GraphNode {
  id: number;
  row: number;
  col: number;
  neighbors: number[];
  player: number | undefined;
}

export interface Edge {
  nodeA: GraphNode;
  nodeB: GraphNode;
}

export type Graph = GraphNode[];

export interface GameState {
  graph: Graph;
  player: number | undefined;
  links: Edge[];
  winner?: number;
}
