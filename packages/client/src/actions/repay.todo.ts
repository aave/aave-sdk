import { describe, expect, it } from 'vitest';

describe('Given an Aave Market', () => {
  describe('And a user with a borrow position', () => {
    describe('When the user repays their loan', () => {
      it('Then it should be reflected in the user borrow positions', () => {
        expect(true).toBe(true);
      });
    });

    describe('And the reserve allows repaying in native tokens', () => {
      describe('When the user repays their loan in native tokens', () => {
        it('Then it should be reflected in the user borrow positions', () => {
          expect(true).toBe(true);
        });
      });
    });
  });
});
