import { type AssistantContent } from './AssistantContent.js';

export interface AssistantModelMessage {
  content: AssistantContent;
  role: 'assistant';
}
