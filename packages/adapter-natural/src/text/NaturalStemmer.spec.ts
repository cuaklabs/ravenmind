import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('natural'));

import natural from 'natural';

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

        vitest
          .mocked(natural.PorterStemmer.stem)
          .mockReturnValueOnce(stemmedWordFixture);

        result = naturalStemmer.stem(wordFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call natural.PorterStemmer.stem()', () => {
        expect(natural.PorterStemmer.stem).toHaveBeenCalledExactlyOnceWith(
          wordFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(stemmedWordFixture);
      });
    });
  });
});
