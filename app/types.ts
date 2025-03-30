export interface CharacterNode {
  id: string;
  name: string;
}

export interface InteractionEdge {
  source: string;
  target: string;
  weight: number;
}

export interface Quote {
  characterId: string;
  characterName: string;
  text: string;
  sentiment: number;
}

export interface BookGraph {
  nodes: CharacterNode[];
  edges: InteractionEdge[];
}

export interface AnalysisResponse {
  status: string;
  graph: BookGraph;
  quotes: Quote[];
}
