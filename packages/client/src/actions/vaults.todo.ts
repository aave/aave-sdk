import { assertOk, evmAddress } from '@aave/types';
import { describe, expect, it } from 'vitest';
import { client, createNewWallet, wallet } from '../test-utils';
import { vaults } from './vaults';

const organization = createNewWallet();
const user = createNewWallet();

function createVault(): ResultAsync<Vault, Error> {}

function deposit(amount: number) {
  return (vault: Vault): ResultAsync<Vault, Error> => {};
}

describe('Given the Aave Vaults', () => {
  describe('When an organization deploys a new vault', () => {
    it('Then it should be available in the organization vaults', async () => {
      // TODO deploy vault

      const result = await vaults(client, {
        criteria: {
          ownedBy: [evmAddress(wallet.account!.address)],
        },
      });

      assertOk(result);

      result.value.items.forEach((vault) => {
        expect(vault).toMatchSnapshot();
      });
    });
  });

  describe('And a deployed organization vault', () => {
    describe('When a user deposits into the vault', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        // assert vault.userState.balance
      });
    });

    describe(`When the user mints some vault's shares`, () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        // assert vault.userState.shares
      });
    });

    describe('When the user withdraws their assets from the vault', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        // assert vault.userState.balance
      });
    });

    describe('When the user redeems their shares', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        // assert vault.userState.shares
      });
    });

    describe(`When the organization changes the vault's fee`, () => {
      it('Then the new fee should be reflected in the vault object', async () => {
        // assert vault.fee
      });
    });

    describe('When users borrow from the underlying vault reserve', () => {
      const borrower = createNewWallet();

      it('Then the vault should accrue its fees', () => {
        // const setup = createVault().andThen(deposit(100));
        // assertOk(result);
        // assert vault.totalFeeRevenue
      });
    });

    describe(`When the organization withdraws the vault's fees`, () => {
      const borrower = createNewWallet();

      it('Then they shoudl receive the expected ERC-20 amount', async () => {});
    });
  });
});
