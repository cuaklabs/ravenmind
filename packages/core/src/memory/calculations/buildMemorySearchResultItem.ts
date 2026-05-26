import { type VectorSearchResult } from '../../vector/models/VectorSearchResult.js';
import { type MemorySearchResultItem } from '../models/MemorySearchResultItem.js';

export function buildMemorySearchResultItem(
  result: VectorSearchResult,
): MemorySearchResultItem {
  return {
    attributedTo: result.payload.attributedTo,
    createdAt: result.payload.createdAt,
    hash: result.payload.hash,
    id: result.id,
    runId: result.payload.runId,
    text: result.payload.text,
    updatedAt: result.payload.updatedAt,
    userId: result.payload.userId,
  };
}
