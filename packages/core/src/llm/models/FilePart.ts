import { type DataContent } from './DataContent.js';

export interface FilePart {
  data: DataContent | URL;
  filename?: string;
  mediaType: string;
  type: 'file';
}
