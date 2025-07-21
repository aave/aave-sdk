import * as matchers from 'jest-extended';
import { expect } from 'vitest';

expect.extend(matchers);

expect.extend({
  toBeBigDecimalCloseTo(
    received: string,
    expected: number | string,
    precision = 2,
  ) {
    const numValue = Number(received);
    const pass =
      !Number.isNaN(numValue) &&
      Math.abs(numValue - Number(expected)) < 10 ** -precision;

    return {
      pass,
      message: () =>
        pass
          ? `expected "${received}" not to be close to ${expected}`
          : `expected "${received}" to be close to ${expected}, but got difference of ${Math.abs(numValue - Number(expected))}`,
    };
  },
});
