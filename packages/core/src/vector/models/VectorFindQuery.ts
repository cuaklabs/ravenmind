import { type VectorFindQueryFilters } from './VectorFindQueryFilters.js';

export interface VectorFindQuery {
  filters: VectorFindQueryFilters;
  limit?: number;
}
