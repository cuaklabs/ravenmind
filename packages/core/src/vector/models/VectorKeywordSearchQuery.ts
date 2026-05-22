import { type VectorSearchQueryFilters } from './VectorSearchQueryFilters.js';

export interface VectorKeywordSearchQuery {
  filters: VectorSearchQueryFilters;
  query: string;
  limit?: number;
}
