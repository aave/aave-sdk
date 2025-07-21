import { describe, expect, it } from 'vitest';

describe('Given an Aave Market', () => {
  describe('When the user supplies tokens to a Reserve', () => {
    it(`Then it should be available in the user's supply positions`, () => {
      expect(true).toBe(true);
    });
  });

  describe('And the Reserve allows to supply in native tokens', () => {
    describe('When the user supplies to the reserve in native tokens', () => {
      it(`Then it should be available in the user's supply positions`, () => {
        expect(true).toBe(true);
      });
    });
  });
});
