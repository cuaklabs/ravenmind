import { type AssistantContent } from '../../llm/models/AssistantContent.js';
import { type FilePart } from '../../llm/models/FilePart.js';
import { type ImagePart } from '../../llm/models/ImagePart.js';
import { type ModelMessage } from '../../llm/models/ModelMessage.js';
import { type TextPart } from '../../llm/models/TextPart.js';
import { type UserContent } from '../../llm/models/UserContent.js';
import { type MemoryAssistantContent } from '../models/MemoryAssistantContent.js';
import { type MemoryFilePart } from '../models/MemoryFilePart.js';
import { type MemoryImagePart } from '../models/MemoryImagePart.js';
import { type MemoryMessage } from '../models/MemoryMessage.js';
import { type MemoryMessagesContext } from '../models/MemoryMessagesContext.js';
import { type MemoryTextPart } from '../models/MemoryTextPart.js';
import { type MemoryUserContent } from '../models/MemoryUserContent.js';

export function buildMemoryMessagesContext(
  messages: ModelMessage[],
): MemoryMessagesContext {
  const aliasToMessageMap: Map<string, ModelMessage> = new Map<
    string,
    ModelMessage
  >();

  const memoryMessages: MemoryMessage[] = messages.map(
    (message: ModelMessage): MemoryMessage =>
      buildMemoryMessage(message, aliasToMessageMap),
  );

  return { aliasToMessageMap, messages: memoryMessages };
}

function buildMemoryImagePart(
  alias: string,
  imagePart: ImagePart,
): MemoryImagePart {
  const memoryImagePart: MemoryImagePart = {
    identifier: alias,
    type: 'image',
  };

  if (imagePart.mediaType !== undefined) {
    memoryImagePart.mediaType = imagePart.mediaType;
  }

  return memoryImagePart;
}

function buildMemoryFilePart(
  alias: string,
  filePart: FilePart,
): MemoryFilePart {
  const memoryFilePart: MemoryFilePart = {
    identifier: alias,
    mediaType: filePart.mediaType,
    type: 'file',
  };

  if (filePart.filename !== undefined) {
    memoryFilePart.filename = filePart.filename;
  }

  return memoryFilePart;
}

function buildMemoryMessage(
  message: ModelMessage,
  aliasToMessageMap: Map<string, ModelMessage>,
): MemoryMessage {
  switch (message.role) {
    case 'system':
      return { content: message.content, role: 'system' };
    case 'user':
      return {
        content: buildMemoryUserContent(
          message.content,
          message,
          aliasToMessageMap,
        ),
        role: 'user',
      };
    case 'assistant':
      return {
        content: buildMemoryAssistantContent(
          message.content,
          message,
          aliasToMessageMap,
        ),
        role: 'assistant',
      };
  }
}

function buildMemoryUserContent(
  content: UserContent,
  message: ModelMessage,
  aliasToMessageMap: Map<string, ModelMessage>,
): MemoryUserContent {
  if (typeof content === 'string') {
    return content;
  }

  return content.map(
    (
      part: TextPart | ImagePart | FilePart,
    ): MemoryTextPart | MemoryImagePart | MemoryFilePart => {
      switch (part.type) {
        case 'text':
          return { text: part.text, type: 'text' };
        case 'image': {
          return buildMemoryImagePart(
            registerMessageAlias(aliasToMessageMap, message),
            part,
          );
        }
        case 'file': {
          return buildMemoryFilePart(
            registerMessageAlias(aliasToMessageMap, message),
            part,
          );
        }
      }
    },
  );
}

function buildMemoryAssistantContent(
  content: AssistantContent,
  message: ModelMessage,
  aliasToMessageMap: Map<string, ModelMessage>,
): MemoryAssistantContent {
  if (typeof content === 'string') {
    return content;
  }

  return content.map(
    (part: TextPart | FilePart): MemoryTextPart | MemoryFilePart => {
      switch (part.type) {
        case 'text':
          return { text: part.text, type: 'text' };
        case 'file': {
          return buildMemoryFilePart(
            registerMessageAlias(aliasToMessageMap, message),
            part,
          );
        }
      }
    },
  );
}

function registerMessageAlias(
  aliasToMessageMap: Map<string, ModelMessage>,
  message: ModelMessage,
): string {
  const alias: string = String(aliasToMessageMap.size);
  aliasToMessageMap.set(alias, message);
  return alias;
}
