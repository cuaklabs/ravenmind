import { type MemoryAssistantContent } from './MemoryAssistantContent.js';

export interface MemoryAssistantMessage {
  content: MemoryAssistantContent;
  role: 'assistant';
}
