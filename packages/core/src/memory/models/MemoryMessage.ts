import { type MemoryAssistantMessage } from './MemoryAssistantMessage.js';
import { type MemorySystemMessage } from './MemorySystemMessage.js';
import { type MemoryUserMessage } from './MemoryUserMessage.js';

export type MemoryMessage =
  | MemoryAssistantMessage
  | MemorySystemMessage
  | MemoryUserMessage;
