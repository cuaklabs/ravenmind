export interface VectorPayload extends Record<string, unknown> {
  attributedTo: 'user' | 'assistant';
  createdAt: Date;
  hash: string;
  text: string;
  textLemmatized: string;
  runId: string | undefined;
  updatedAt: Date;
  userId: string | undefined;
}
