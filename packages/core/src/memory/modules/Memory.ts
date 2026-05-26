import { createHash, type Hash } from 'node:crypto';

import { v4 as uuidV4 } from 'uuid';

import { type MemoryHistory } from '../../history/models/MemoryHistory.js';
import { type MessageFindQueryFilters } from '../../history/models/MessageFindQueryFilters.js';
import { type MemoryHistoryProvider } from '../../history/modules/MemoryHistoryProvider.js';
import { type FilePart } from '../../llm/models/FilePart.js';
import { type ImagePart } from '../../llm/models/ImagePart.js';
import { type ModelMessage } from '../../llm/models/ModelMessage.js';
import { type SystemModelMessage } from '../../llm/models/SystemModelMessage.js';
import { type TextPart } from '../../llm/models/TextPart.js';
import { type TextGenerator } from '../../llm/modules/TextGenerator.js';
import { type Stemmer } from '../../text/modules/Stemmer.js';
import { type Tokenizer } from '../../text/modules/Tokenizer.js';
import { type VectorInsertQuery } from '../../vector/models/VectorInsertQuery.js';
import { type VectorSearchQueryFilters } from '../../vector/models/VectorSearchQueryFilters.js';
import { type VectorSearchResult } from '../../vector/models/VectorSearchResult.js';
import { type Embedder } from '../../vector/modules/Embedder.js';
import { type VectorStore } from '../../vector/modules/VectorStore.js';
import { buildBm25Params } from '../calculations/buildBm25Params.js';
import { buildMemoryMessagesContext } from '../calculations/buildMemoryMessagesContext.js';
import { buildMemorySearchResultItem } from '../calculations/buildMemorySearchResultItem.js';
import { buildVectorResultsByScore } from '../calculations/buildVectorResultsByScore.js';
import {
  DEFAULT_CUSTOM_INSTRUCTIONS,
  MEMORY_EXTRACTION_PROMPT,
} from '../data/memoryExtractionPrompt.js';
import { type AddMessagesOptions } from '../models/AddMessageOptions.js';
import { type ExistingMemoryItem } from '../models/ExistingMemoryItem.js';
import {
  type MemoryExtraction,
  type MemoryExtractionItem,
  MemoryExtractionSchema,
} from '../models/MemoryExtractionSchema.js';
import { type MemorySearchFilters } from '../models/MemorySearchFilters.js';
import { type MemorySearchOptions } from '../models/MemorySearchOptions.js';
import { type MemorySearchResult } from '../models/MemorySearchResult.js';

const YYYYMMDD_STRINGIFIED_DATE_LENGTH: number = 10;

const HASH_ALGORITHM: string = 'md5';

const MEMORY_HISTORY_LIMIT: number = 10;
const VECTOR_SEARCH_LIMIT: number = 5;

const MEMORY_SEARCH_DEFAULT_LIMIT: number = 15;
const MEMORY_SEARCH_DEFAULT_THRESHOLD: number = 0.1;
const MEMORY_SEARCH_MAX_LIMIT: number = 15;
const MEMORY_SEARCH_POOL_FACTOR: number = 4;

export class Memory {
  readonly #embedder: Embedder;
  readonly #hash: Hash;
  readonly #memoryHistoryProvider: MemoryHistoryProvider;
  readonly #stemmer: Stemmer;
  readonly #textGenerator: TextGenerator;
  readonly #tokenizer: Tokenizer;
  readonly #vectorStore: VectorStore;

  constructor(
    embedder: Embedder,
    memoryHistoryProvider: MemoryHistoryProvider,
    stemmer: Stemmer,
    textGenerator: TextGenerator,
    tokenizer: Tokenizer,
    vectorStore: VectorStore,
  ) {
    this.#embedder = embedder;
    this.#hash = createHash(HASH_ALGORITHM);
    this.#memoryHistoryProvider = memoryHistoryProvider;
    this.#stemmer = stemmer;
    this.#textGenerator = textGenerator;
    this.#tokenizer = tokenizer;
    this.#vectorStore = vectorStore;
  }

  public async add(
    messages: ModelMessage[],
    options?: AddMessagesOptions,
  ): Promise<void> {
    const memoryExtraction: MemoryExtraction =
      await this.#extractMemoriesFromMessages(messages, options);

    await this.#persistMessages(messages, options);

    await this.#persistMemories(memoryExtraction, options);
  }

  public async search(
    query: string,
    config: MemorySearchOptions,
  ): Promise<MemorySearchResult> {
    const tokens: string[] = this.#getTokens(query);

    const limit: number =
      Math.min(
        config.limit ?? MEMORY_SEARCH_DEFAULT_LIMIT,
        MEMORY_SEARCH_MAX_LIMIT,
      ) * MEMORY_SEARCH_POOL_FACTOR;

    const semanticResults: VectorSearchResult[] = await this.#semanticSearch(
      query,
      config.filters,
      limit,
    );

    const memoryIdToBm25ScoreMap: Map<string, number> =
      await this.#buildMemoryIdToBm25ScoreMap(config, limit, tokens);

    const sortedResults: VectorSearchResult[] = buildVectorResultsByScore(
      semanticResults,
      memoryIdToBm25ScoreMap,
      config.threshold ?? MEMORY_SEARCH_DEFAULT_THRESHOLD,
    );

    return {
      results: sortedResults.map(buildMemorySearchResultItem),
    };
  }

  async #buildMemoryIdToBm25ScoreMap(
    config: MemorySearchOptions,
    limit: number,
    tokens: string[],
  ): Promise<Map<string, number>> {
    const queryLemmatized: string = this.#lemmatizeTokens(tokens);

    const keywordsResults: VectorSearchResult[] =
      await this.#vectorStore.keywordSearch({
        filters: {
          runId: config.filters?.runId,
          userId: config.filters?.userId,
        },
        limit,
        query: queryLemmatized,
      });

    const memoryIdToBm25ScoreMap: Map<string, number> = new Map();

    const [midpoint, steepness]: [number, number] = buildBm25Params(
      tokens.length,
    );

    for (const result of keywordsResults) {
      const rawScore: number = result.score;
      if (rawScore > 0) {
        memoryIdToBm25ScoreMap.set(
          result.id,
          this.#normalizeBm25(rawScore, midpoint, steepness),
        );
      }
    }

    return memoryIdToBm25ScoreMap;
  }

  async #extractMemoriesFromMessages(
    messages: ModelMessage[],
    options: AddMessagesOptions | undefined,
  ): Promise<MemoryExtraction> {
    const nonSystemMessages: Exclude<ModelMessage, SystemModelMessage>[] =
      messages.filter(
        (
          message: ModelMessage,
        ): message is Exclude<ModelMessage, SystemModelMessage> =>
          message.role !== 'system',
      );

    const vectorResults: VectorSearchResult[] =
      await this.#getVectorResultsFromVectors(nonSystemMessages, options);

    const lastMessages: ModelMessage[] = await this.#getLastMessages(options);

    const numericIdToUuidMap: Map<string, string> = new Map();

    const existingMemoryItems: ExistingMemoryItem[] = vectorResults.map(
      (result: VectorSearchResult, index: number): ExistingMemoryItem => {
        const numericId: string = String(index);
        numericIdToUuidMap.set(numericId, result.id);
        return { id: numericId, text: result.payload.text };
      },
    );

    const yyyyMmDdStringifiedCurrentDate: string = new Date()
      .toISOString()
      .slice(0, YYYYMMDD_STRINGIFIED_DATE_LENGTH);

    const yyyyMmDdStringifiedObservationDate: string =
      options?.observationDate === undefined
        ? yyyyMmDdStringifiedCurrentDate
        : options.observationDate
            .toISOString()
            .slice(0, YYYYMMDD_STRINGIFIED_DATE_LENGTH);

    const allMessages: ModelMessage[] = [
      {
        content: MEMORY_EXTRACTION_PROMPT,
        role: 'system',
      },
      {
        content: 'Summary: ""',
        role: 'system',
      },
      {
        content: 'Recently Extracted: []',
        role: 'system',
      },
      {
        content: `Existing Memories: ${JSON.stringify(existingMemoryItems)}`,
        role: 'system',
      },
      {
        content: `Observation Date: ${yyyyMmDdStringifiedObservationDate}\nCurrent Date: ${yyyyMmDdStringifiedCurrentDate}`,
        role: 'system',
      },
      {
        content: `Custom Instructions: ${DEFAULT_CUSTOM_INSTRUCTIONS}`,
        role: 'system',
      },
      {
        content: `Last k Messages:\n${JSON.stringify(buildMemoryMessagesContext(lastMessages).messages)}`,
        role: 'system',
      },
      {
        content: `New Messages:\n${JSON.stringify(buildMemoryMessagesContext(nonSystemMessages).messages)}`,
        role: 'system',
      },
    ];

    const rawExtraction: MemoryExtraction =
      await this.#textGenerator.generateText(
        allMessages,
        MemoryExtractionSchema,
      );

    const extractionWithMappedIds: MemoryExtraction = {
      memory: rawExtraction.memory.map(
        (item: MemoryExtractionItem): MemoryExtractionItem => ({
          ...item,
          linkedMemoryIds: item.linkedMemoryIds
            .map((numericId: string): string | undefined =>
              numericIdToUuidMap.get(numericId),
            )
            .filter((id: string | undefined): id is string => id !== undefined),
        }),
      ),
    };

    return extractionWithMappedIds;
  }

  async #getLastMessages(
    options: AddMessagesOptions | undefined,
  ): Promise<ModelMessage[]> {
    const filters: MessageFindQueryFilters = {};

    if (options?.metadata?.runId !== undefined) {
      filters.runId = options.metadata.runId;
    }

    if (options?.metadata?.userId !== undefined) {
      filters.userId = options.metadata.userId;
    }

    return this.#memoryHistoryProvider.findMessages({
      filters,
      limit: MEMORY_HISTORY_LIMIT,
    });
  }

  #getTokens(text: string): string[] {
    return this.#tokenizer.tokenize(text.toLowerCase());
  }

  async #getVectorResultsFromVectors(
    nonSystemMessages: ModelMessage[],
    options: AddMessagesOptions | undefined,
  ): Promise<VectorSearchResult[]> {
    const textMessages: string[] = nonSystemMessages.flatMap(
      (message: ModelMessage): string[] => {
        if (typeof message.content === 'string') {
          return [message.content];
        } else {
          return (message.content as (TextPart | FilePart | ImagePart)[])
            .filter<TextPart>(
              (part: TextPart | FilePart | ImagePart): part is TextPart =>
                part.type === 'text',
            )
            .map((part: TextPart) => part.text);
        }
      },
    );

    const vectors: number[][] = await this.#embedder.embedBatch(textMessages);

    const idToVectorResultMap: Map<string, VectorSearchResult> = new Map();

    const vectorSearchQueryFilters: VectorSearchQueryFilters = {};

    if (options?.metadata?.runId !== undefined) {
      vectorSearchQueryFilters.runId = options.metadata.runId;
    }

    if (options?.metadata?.userId !== undefined) {
      vectorSearchQueryFilters.userId = options.metadata.userId;
    }

    for (const vector of vectors) {
      const vectorSearchResults: VectorSearchResult[] =
        await this.#vectorStore.search({
          filters: vectorSearchQueryFilters,
          limit: VECTOR_SEARCH_LIMIT,
          query: vector,
        });

      for (const vectorSearchResult of vectorSearchResults) {
        idToVectorResultMap.set(vectorSearchResult.id, vectorSearchResult);
      }
    }

    return [...idToVectorResultMap.values()];
  }

  #lemmatizeText(text: string): string {
    return this.#lemmatizeTokens(this.#getTokens(text));
  }

  #lemmatizeTokens(tokens: string[]): string {
    const stemmedTokens: string[] = tokens.map((token: string) =>
      this.#stemmer.stem(token),
    );

    return stemmedTokens.join(' ');
  }

  #normalizeBm25(
    rawScore: number,
    midpoint: number,
    steepness: number,
  ): number {
    return 1.0 / (1.0 + Math.exp(-steepness * (rawScore - midpoint)));
  }

  async #persistMemories(
    memoryExtraction: MemoryExtraction,
    options: AddMessagesOptions | undefined,
  ): Promise<void> {
    const vectors: number[][] = await this.#embedder.embedBatch(
      memoryExtraction.memory.map(
        (memory: MemoryExtractionItem) => memory.text,
      ),
    );

    if (vectors.length !== memoryExtraction.memory.length) {
      throw new Error(
        'The number of vectors returned by the embedder does not match the number of memories extracted',
      );
    }

    // Compose vector insert queries

    const vectorInsertQueries: VectorInsertQuery[] = [];

    const now: Date = new Date();

    for (let i: number = 0; i < memoryExtraction.memory.length; ++i) {
      const memory: MemoryExtractionItem = memoryExtraction.memory[
        i
      ] as MemoryExtractionItem;
      const vector: number[] = vectors[i] as number[];

      vectorInsertQueries.push({
        id: uuidV4(),
        payload: {
          attributedTo: memory.attributedTo,
          createdAt: now,
          hash: this.#hash.update(memory.text).digest('hex'),
          runId: options?.metadata?.runId,
          text: memory.text,
          textLemmatized: this.#lemmatizeText(memory.text),
          updatedAt: now,
          userId: options?.metadata?.userId,
        },
        vector,
      });
    }

    await this.#vectorStore.insert(vectorInsertQueries);

    // Save memory history
    await this.#memoryHistoryProvider.addHistory(
      memoryExtraction.memory.map(
        (memory: MemoryExtractionItem): MemoryHistory => ({
          action: 'add',
          createdAt: now,
          id: uuidV4(),
          memoryId: memory.id,
          previousValue: null,
          value: memory.text,
        }),
      ),
    );
  }

  async #persistMessages(
    messages: ModelMessage[],
    options: AddMessagesOptions | undefined,
  ): Promise<void> {
    const createdAt: Date = new Date();

    await this.#memoryHistoryProvider.addMessages(
      messages.map((message: ModelMessage) => ({
        createdAt,
        message,
        runId: options?.metadata?.runId,
        userId: options?.metadata?.userId,
      })),
    );
  }

  async #semanticSearch(
    query: string,
    filters: MemorySearchFilters | undefined,
    limit: number,
  ): Promise<VectorSearchResult[]> {
    const queryEmbedding: number[] = await this.#embedder.embed(query);

    return this.#vectorStore.search({
      filters: {
        runId: filters?.runId,
        userId: filters?.userId,
      },
      limit,
      query: queryEmbedding,
    });
  }
}
