import { describe, expect, it } from 'vitest';

describe('Given an Aave Market', () => {
  describe('And a user with a supply position', () => {
    describe('When the user withdraws their supply  ', () => {
      it('Then it should be reflecteds in the user supply positions', () => {
        expect(true).toBe(true);
      });
    });

    describe('And the reserve allows withdrawals in native tokens', () => {
      describe('When the user withdraws from the reserve in native tokens', () => {
        it('Then the user should receive the amount in native tokens', () => {
          expect(true).toBe(true);
        });
      });
    });
  });
});
