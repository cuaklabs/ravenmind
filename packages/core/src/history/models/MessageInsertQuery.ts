import { type ModelMessage } from '../../llm/models/ModelMessage.js';

export type MessageInsertQuery = {
  createdAt: Date;
  message: ModelMessage;
  runId: string | undefined;
  userId: string | undefined;
}[];
