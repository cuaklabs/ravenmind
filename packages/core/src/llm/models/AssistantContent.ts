import { type FilePart } from './FilePart.js';
import { type TextPart } from './TextPart.js';

export type AssistantContent = string | Array<TextPart | FilePart>;
