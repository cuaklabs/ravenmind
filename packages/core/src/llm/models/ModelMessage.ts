import { type AssistantModelMessage } from './AssistantModelMessage.js';
import { type SystemModelMessage } from './SystemModelMessage.js';
import { type UserModelMessage } from './UserModelMessage.js';

export type ModelMessage =
  | AssistantModelMessage
  | UserModelMessage
  | SystemModelMessage;
