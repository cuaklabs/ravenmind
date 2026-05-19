import { type VectorPayload } from './VectorPayload.js';

export interface VectorSearchResult {
  id: string;
  payload: VectorPayload;
  score: number;
}
