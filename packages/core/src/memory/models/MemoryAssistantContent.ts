import { type MemoryFilePart } from './MemoryFilePart.js';
import { type MemoryTextPart } from './MemoryTextPart.js';

export type MemoryAssistantContent =
  | string
  | Array<MemoryTextPart | MemoryFilePart>;
