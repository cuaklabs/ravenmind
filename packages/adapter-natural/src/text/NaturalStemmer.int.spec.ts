import { beforeAll, describe, expect, it } from 'vitest';

import { NaturalStemmer } from './NaturalStemmer.js';

describe(NaturalStemmer, () => {
  let naturalStemmer: NaturalStemmer;

  beforeAll(() => {
    naturalStemmer = new NaturalStemmer();
  });

  describe('.stem', () => {
    let wordFixture: string;

    beforeAll(() => {
      wordFixture = 'words';
    });

    describe('when called', () => {
      let stemmedWordFixture: string;

      let result: unknown;

      beforeAll(() => {
        stemmedWordFixture = 'word';

        result = naturalStemmer.stem(wordFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe(stemmedWordFixture);
      });
    });
  });
});
