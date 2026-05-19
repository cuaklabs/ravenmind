import { type VectorSearchQueryFilters } from './VectorSearchQueryFilters.js';

export interface VectorFindQuery {
  filters: VectorSearchQueryFilters;
  limit?: number;
}
