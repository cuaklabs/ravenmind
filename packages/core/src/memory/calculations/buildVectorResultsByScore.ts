import { type VectorSearchResult } from '../../vector/models/VectorSearchResult.js';

export function buildVectorResultsByScore(
  results: VectorSearchResult[],
  memoryIdToBm25ScoreMap: Map<string, number>,
  threshold: number,
): VectorSearchResult[] {
  return results
    .filter((result: VectorSearchResult) => result.score >= threshold)
    .sort(
      (firstResult: VectorSearchResult, secondResult: VectorSearchResult) => {
        const bm25ScoreA: number =
          memoryIdToBm25ScoreMap.get(firstResult.id) ?? 0;
        const bm25ScoreB: number =
          memoryIdToBm25ScoreMap.get(secondResult.id) ?? 0;

        const combinedScoreA: number = firstResult.score + bm25ScoreA;
        const combinedScoreB: number = secondResult.score + bm25ScoreB;

        return combinedScoreB - combinedScoreA;
      },
    );
}
