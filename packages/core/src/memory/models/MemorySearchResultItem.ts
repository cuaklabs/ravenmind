export interface MemorySearchResultItem {
  id: string;
  attributedTo: 'user' | 'assistant';
  createdAt: Date;
  hash: string;
  text: string;
  runId: string | undefined;
  updatedAt: Date;
  userId: string | undefined;
}
