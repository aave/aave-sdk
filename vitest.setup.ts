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

  toBeBigDecimalWithin(received: string, start: number, end: number) {
    const numValue = Number(received);

    const pass =
      !Number.isNaN(numValue) && numValue >= start && numValue <= end;

    return {
      pass,
      message: () =>
        pass
          ? `expected "${received}" not to be within range [${start}, ${end}]`
          : `expected "${received}" to be within range [${start}, ${end}], but got ${numValue}`,
    };
  },

  toBeBigDecimalGreaterThan(received: string, expected: number | string) {
    const numValue = Number(received);
    const pass = !Number.isNaN(numValue) && numValue > Number(expected);
    return {
      pass,
      message: () =>
        pass
          ? `expected "${received}" not to be greater than ${expected}`
          : `expected "${received}" to be greater than ${expected}, but got ${numValue}`,
    };
  },

  toBeBetweenDates(received: string, start: Date, end: Date) {
    const receivedDate = new Date(received);
    const pass =
      !Number.isNaN(receivedDate.getTime()) &&
      receivedDate >= start &&
      receivedDate <= end;

    return {
      pass,
      message: () =>
        pass
          ? `expected "${received}" not to be between ${start.toISOString()} and ${end.toISOString()}`
          : `expected "${received}" to be between ${start.toISOString()} and ${end.toISOString()}, but got ${receivedDate.toISOString()}`,
    };
  },

  toBeHexString: (received) => {
    return {
      pass: /^0x[a-fA-F0-9]+$/.test(received),
      message: () => `expected ${received} to be an hex string (0x…)`,
    };
  },
});
