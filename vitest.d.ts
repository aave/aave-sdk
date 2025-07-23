import 'vitest';

declare module 'vitest' {
  interface AsymmetricMatchersContaining extends JestExtendedMatchers {
    toBeBigDecimalCloseTo: (expected: number | string, precision?: number) => R;
  }
}
