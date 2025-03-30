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
  status: 'downloading' | 'processing' | 'processed';
  graph?: BookGraph;
  quotes: Quote[];
}

export interface BookMetadata {
  author: string;
  publicationDate?: string;
  publisher: string;
  language: string;
  rights: string;
  subjects: string[];
}

export interface JobResponse {
  jobId: number;
  metadata: BookMetadata;
  warning?: string;
}
