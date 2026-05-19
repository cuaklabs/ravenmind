import type url from 'node:url';

import { type DataContent } from './DataContent.js';

export interface ImagePart {
  image: DataContent | url.URL;
  mediaType?: string;
  type: 'image';
}
