import { type VectorFindQuery } from '../models/VectorFindQuery.js';
import { type VectorInsertQuery } from '../models/VectorInsertQuery.js';
import { type VectorPayload } from '../models/VectorPayload.js';
import { type VectorResult } from '../models/VectorResult.js';
import { type VectorSearchQuery } from '../models/VectorSearchQuery.js';
import { type VectorSearchResult } from '../models/VectorSearchResult.js';
import { type VectorUpdateQuery } from '../models/VectorUpdateQuery.js';

export interface VectorStore {
  delete(id: string): Promise<void>;
  getPayload(id: string): Promise<VectorPayload | null>;
  find(query: VectorFindQuery): Promise<VectorResult[]>;
  insert(queries: VectorInsertQuery[]): Promise<void>;
  search(query: VectorSearchQuery): Promise<VectorSearchResult[]>;
  update(queries: VectorUpdateQuery[]): Promise<void>;
}
