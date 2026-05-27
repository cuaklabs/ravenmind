import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('natural'));

import natural from 'natural';

import { NaturalTokenizer } from './NaturalTokenizer.js';

describe(NaturalTokenizer, () => {
  let aggressiveTokenizerMock: Mocked<natural.AggressiveTokenizer>;
  let naturalTokenizer: NaturalTokenizer;

  beforeAll(() => {
    aggressiveTokenizerMock = {
      tokenize: vitest.fn(),
    } as Partial<
      Mocked<natural.AggressiveTokenizer>
    > as Mocked<natural.AggressiveTokenizer>;

    vitest.mocked(natural.AggressiveTokenizer).mockImplementation(
      class implements Partial<Mocked<natural.AggressiveTokenizer>> {
        public tokenize: Mocked<natural.AggressiveTokenizer>['tokenize'] =
          aggressiveTokenizerMock.tokenize.bind(aggressiveTokenizerMock);
      } as unknown as typeof natural.AggressiveTokenizer,
    );

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
        aggressiveTokenizerMock.tokenize.mockReturnValue(tokensFixture);

        result = naturalTokenizer.tokenize(textFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call the natural.AggressiveTokenizer.tokenize()', () => {
        expect(
          aggressiveTokenizerMock.tokenize,
        ).toHaveBeenCalledExactlyOnceWith(textFixture);
      });

      it('should return expected result', () => {
        expect(result).toBe(tokensFixture);
      });
    });
  });
});
