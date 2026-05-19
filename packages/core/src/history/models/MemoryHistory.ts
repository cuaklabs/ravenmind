import { type MemoryAdditionHistory } from './MemoryAdditionHistory.js';
import { type MemoryDeletionHistory } from './MemoryDeletionHistory.js';
import { type MemoryUpdateHistory } from './MemoryUpdateHistory.js';

export type MemoryHistory =
  | MemoryAdditionHistory
  | MemoryDeletionHistory
  | MemoryUpdateHistory;
