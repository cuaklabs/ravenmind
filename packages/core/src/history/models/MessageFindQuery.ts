import { type MessageFindQueryFilters } from './MessageFindQueryFilters.js';

export interface MessageFindQuery {
  filters: MessageFindQueryFilters;
  limit?: number;
}
