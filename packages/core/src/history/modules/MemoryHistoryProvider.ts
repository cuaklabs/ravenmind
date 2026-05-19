import { type ModelMessage } from '../../llm/models/ModelMessage.js';
import { type MemoryHistory } from '../models/MemoryHistory.js';
import { type MemoryHistoryFindQuery } from '../models/MemoryHistoryFindQuery.js';
import { type MemoryHistoryInsertQuery } from '../models/MemoryHistoryInsertQuery.js';
import { type MessageFindQuery } from '../models/MessageFindQuery.js';
import { type MessageInsertQuery } from '../models/MessageInsertQuery.js';

export interface MemoryHistoryProvider {
  addHistory(query: MemoryHistoryInsertQuery): Promise<void>;
  addMessages(query: MessageInsertQuery): Promise<void>;
  findHistory(query: MemoryHistoryFindQuery): Promise<MemoryHistory[]>;
  findMessages(query: MessageFindQuery): Promise<ModelMessage[]>;
}
