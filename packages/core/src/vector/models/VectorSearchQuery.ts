import { type VectorSearchQueryFilters } from './VectorSearchQueryFilters.js';

export interface VectorSearchQuery {
  filters: VectorSearchQueryFilters;
  query: string;
  limit?: number;
}
