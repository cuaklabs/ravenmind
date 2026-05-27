import { type Stemmer } from '@ravenmindjs/core/text';
import natural from 'natural';

export class NaturalStemmer implements Stemmer {
  public stem(word: string): string {
    return natural.PorterStemmer.stem(word);
  }
}
