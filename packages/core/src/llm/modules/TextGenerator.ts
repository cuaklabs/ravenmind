import { type StandardSchemaV1 } from '@standard-schema/spec';

import { type ModelMessage } from '../models/ModelMessage.js';

export interface TextGenerator {
  generateText(messages: ModelMessage[]): Promise<string>;
  generateText<TOutput>(
    messages: ModelMessage[],
    outputFormat: StandardSchemaV1<unknown, TOutput>,
  ): Promise<TOutput>;
}
