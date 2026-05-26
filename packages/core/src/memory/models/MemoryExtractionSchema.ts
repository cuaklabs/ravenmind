import z from 'zod';

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/typedef
export const MemoryExtractionItemSchema = z.object({
  attributedTo: z.enum(['user', 'assistant']),
  id: z.string(),
  linkedMemoryIds: z.array(z.string()),
  text: z.string(),
});

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/typedef
export const MemoryExtractionSchema = z.object({
  memory: z.array(MemoryExtractionItemSchema),
});

export type MemoryExtraction = z.infer<typeof MemoryExtractionSchema>;
export type MemoryExtractionItem = z.infer<typeof MemoryExtractionItemSchema>;
