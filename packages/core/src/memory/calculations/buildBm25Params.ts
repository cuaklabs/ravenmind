/* eslint-disable @typescript-eslint/no-magic-numbers */

export function buildBm25Params(tokenCount: number): [number, number] {
  if (tokenCount <= 3) {
    return [5.0, 0.7];
  } else if (tokenCount <= 6) {
    return [7.0, 0.6];
  } else if (tokenCount <= 9) {
    return [9.0, 0.5];
  } else if (tokenCount <= 15) {
    return [10.0, 0.5];
  } else {
    return [12.0, 0.5];
  }
}
