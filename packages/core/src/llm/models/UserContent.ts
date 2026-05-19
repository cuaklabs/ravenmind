import { type FilePart } from './FilePart.js';
import { type ImagePart } from './ImagePart.js';
import { type TextPart } from './TextPart.js';

export type UserContent = string | Array<TextPart | ImagePart | FilePart>;
