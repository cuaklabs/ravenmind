import { type MemoryFilePart } from './MemoryFilePart.js';
import { type MemoryImagePart } from './MemoryImagePart.js';
import { type MemoryTextPart } from './MemoryTextPart.js';

export type MemoryUserContent =
  | string
  | Array<MemoryTextPart | MemoryImagePart | MemoryFilePart>;
