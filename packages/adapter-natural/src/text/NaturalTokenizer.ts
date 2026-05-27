import { type Tokenizer } from '@ravenmindjs/core/text';
import natural from 'natural';

export class NaturalTokenizer implements Tokenizer {
  readonly #tokenizer: natural.AggressiveTokenizer;

  constructor() {
    this.#tokenizer = new natural.AggressiveTokenizer();
  }

  public tokenize(text: string): string[] {
    return this.#tokenizer.tokenize(text);
  }
}
