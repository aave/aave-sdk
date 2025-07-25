import 'vitest';

declare module 'vitest' {
  interface AsymmetricMatchersContaining extends JestExtendedMatchers {
    toBeBigDecimalCloseTo: (expected: number | string, precision?: number) => R;
    toBeWithinBigDecimal: (start: number | string, end: number | string) => R;
    toBeBetweenDates: (start: Date, end: Date) => R;
  }
}
