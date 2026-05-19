import { type UserContent } from './UserContent.js';

export interface UserModelMessage {
  content: UserContent;
  role: 'user';
}
