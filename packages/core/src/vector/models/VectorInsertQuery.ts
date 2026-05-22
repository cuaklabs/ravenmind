import { type VectorPayload } from './VectorPayload.js';

export interface VectorInsertQuery {
  id: string;
  payload: VectorPayload;
  vector: number[];
}
