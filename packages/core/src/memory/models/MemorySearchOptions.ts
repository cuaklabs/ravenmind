import { type MemorySearchFilters } from './MemorySearchFilters.js';

export interface MemorySearchOptions {
  limit?: number;
  filters?: MemorySearchFilters;
  threshold?: number;
}
