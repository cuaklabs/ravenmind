import { type ModelMessage } from '../../llm/models/ModelMessage.js';
import { type MemoryMessage } from './MemoryMessage.js';

export interface MemoryMessagesContext {
  aliasToMessageMap: Map<string, ModelMessage>;
  messages: MemoryMessage[];
}
