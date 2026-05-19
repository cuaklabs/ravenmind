import { type VectorPayload } from './VectorPayload.js';

export interface VectorUpdateQuery {
  id: string;
  payload?: VectorPayload;
  vector?: number[];
}
