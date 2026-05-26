import { type MemoryUserContent } from './MemoryUserContent.js';

export interface MemoryUserMessage {
  content: MemoryUserContent;
  role: 'user';
}
