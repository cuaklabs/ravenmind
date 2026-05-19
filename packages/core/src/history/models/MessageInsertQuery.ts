import { type ModelMessage } from '../../llm/models/ModelMessage.js';

export interface MessageInsertQuery {
  createdAt: Date;
  message: ModelMessage;
  runId: string | undefined;
  userId: string | undefined;
}
