import { beforeAll, describe, expect, it } from 'vitest';

import { NaturalTokenizer } from './NaturalTokenizer.js';

describe(NaturalTokenizer, () => {
  let naturalTokenizer: NaturalTokenizer;

  beforeAll(() => {
    naturalTokenizer = new NaturalTokenizer();
  });

  describe('.tokenize', () => {
    let textFixture: string;

    beforeAll(() => {
      textFixture = 'This is a test.';
    });

    describe('when called', () => {
      let tokensFixture: string[];

      let result: unknown;

      beforeAll(() => {
        tokensFixture = ['This', 'is', 'a', 'test'];

        result = naturalTokenizer.tokenize(textFixture);
      });

      it('should return expected result', () => {
        expect(result).toStrictEqual(tokensFixture);
      });
    });
  });
});
