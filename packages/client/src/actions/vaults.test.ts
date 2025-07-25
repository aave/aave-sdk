import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  getBalance,
  WETH_ADDRESS,
  wait,
} from '../test-utils';
import { sendWith } from '../viem';
import {
  vaultRedeemShares,
  vaultSetFee,
  vaultWithdraw,
  vaultWithdrawFees,
} from './transactions';
import { createVault, deposit, mintShares } from './vault.helpers';
import { userVaults, vault, vaults } from './vaults';

const organization = createNewWallet();
const user = createNewWallet();

describe('Given the Aave Vaults', () => {
  describe('When an organization deploys a new vault', () => {
    it('Then it should be available in the organization vaults', async () => {
      const initialVault = await createVault(organization);
      assertOk(initialVault);

      const result = await vaults(client, {
        criteria: {
          ownedBy: [evmAddress(organization.account!.address)],
        },
      });

      assertOk(result);
      expect(result.value.items).toEqual([
        expect.objectContaining({
          owner: organization.account!.address,
          address: initialVault.value!.address,
        }),
      ]);
    });
  });

  describe('And a deployed organization vault', () => {
    describe('When a user deposits into the vault', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault(organization)
          .andThen(deposit(user, 1))
          .andTee(() => wait(4000)); // wait for the deposit to be processed
        assertOk(initialVault);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });

        assertOk(userPositions);
        expect(userPositions.value.items.length).toEqual(1);
        expect(userPositions.value.items).toEqual([
          expect.objectContaining({
            balance: expect.objectContaining({
              amount: expect.objectContaining({
                value: expect.toBeBigDecimalCloseTo(1, 4),
              }),
            }),
          }),
        ]);
      }, 30_000);
    });

    describe(`When the user mints some vault's shares`, () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault(organization)
          .andThen(mintShares(user, 1))
          .andTee(() => wait(4000)); // wait for the mint to be processed
        assertOk(initialVault);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        expect(userPositions.value.items).toEqual([
          expect.objectContaining({
            userShares: expect.objectContaining({
              shares: expect.objectContaining({
                amount: expect.objectContaining({
                  value: expect.toBeBigDecimalCloseTo(1, 4),
                }),
              }),
            }),
          }),
        ]);
      }, 30_000);
    });

    describe('When the user withdraws their assets from the vault', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const amountToWithdraw = 1.0;
        const initialVault = await createVault(organization)
          .andThen(deposit(user, amountToWithdraw))
          .andTee(() => wait(2000)); // wait for the deposit to be processed
        assertOk(initialVault);

        const balanceBefore = await getBalance(
          evmAddress(user.account!.address),
          WETH_ADDRESS,
        );

        const withdrawResult = await vaultWithdraw(client, {
          chainId: initialVault.value?.chainId,
          sharesOwner: evmAddress(user.account!.address),
          underlyingToken: {
            asAToken: false,
            amount: bigDecimal(amountToWithdraw.toString()),
          },
          vault: initialVault.value?.address,
        })
          .andThen(sendWith(user))
          .andTee((tx) => console.log(`tx to withdraw from vault: ${tx}`))
          .andTee(() => wait(3000)); // wait for the withdraw to be processed
        assertOk(withdrawResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        const balanceAfter = await getBalance(
          evmAddress(user.account!.address),
          WETH_ADDRESS,
        );
        expect(balanceAfter).toEqual(balanceBefore + amountToWithdraw);
        expect(userPositions.value.items).toEqual([
          expect.objectContaining({
            userShares: expect.objectContaining({
              shares: expect.objectContaining({
                amount: expect.objectContaining({
                  value: expect.toBeBigDecimalCloseTo(0, 4),
                }),
              }),
            }),
          }),
        ]);
      }, 40_000);
    });

    describe('When the user redeems total amount of their shares', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault(organization)
          .andThen(mintShares(user, 1))
          .andTee(() => wait(2000)); // wait for the mint to be processed
        assertOk(initialVault);

        const redeemResult = await vaultRedeemShares(client, {
          shares: {
            amount: bigDecimal('1'),
          },
          vault: initialVault.value!.address,
          chainId: initialVault.value!.chainId,
          sharesOwner: evmAddress(user.account!.address),
        })
          .andThen(sendWith(user))
          .andTee((tx) => console.log(`tx to redeem shares: ${tx}`))
          .andTee(() => wait(3000)); // wait for the redeem to be processed
        assertOk(redeemResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        expect(userPositions.value.items.length).toEqual(0);
      }, 40_000);
    });

    describe('When the user redeems partial amount of their shares', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault(organization)
          .andThen(mintShares(user, 1))
          .andTee(() => wait(2000)); // wait for the mint to be processed
        assertOk(initialVault);

        const redeemResult = await vaultRedeemShares(client, {
          shares: {
            amount: bigDecimal('0.5'),
          },
          vault: initialVault.value!.address,
          chainId: initialVault.value!.chainId,
          sharesOwner: evmAddress(user.account!.address),
        })
          .andThen(sendWith(user))
          .andTee((tx) => console.log(`tx to redeem shares: ${tx}`))
          .andTee(() => wait(3000)); // wait for the redeem to be processed
        assertOk(redeemResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        expect(userPositions.value.items).toEqual([
          expect.objectContaining({
            userShares: expect.objectContaining({
              shares: expect.objectContaining({
                amount: expect.objectContaining({
                  value: expect.toBeBigDecimalCloseTo(0.5, 4),
                }),
              }),
            }),
          }),
        ]);
      }, 40_000);
    });

    describe(`When the organization changes the vault's fee`, () => {
      it('Then the new fee should be reflected in the vault object', async () => {
        const initialVault = await createVault(organization);
        assertOk(initialVault);

        const newFee = bigDecimal('4.60');
        const updateResult = await vaultSetFee(client, {
          chainId: initialVault.value.chainId,
          vault: initialVault.value.address,
          newFee: newFee,
        })
          .andThen(sendWith(organization))
          .andTee((tx) => console.log(`tx to set fee: ${tx}`))
          .andTee(() => wait(4000)); // wait for the update to be processed
        assertOk(updateResult);

        const newVaultInfo = await vault(client, {
          by: { address: initialVault.value.address },
          chainId: initialVault.value.chainId,
        });
        assertOk(newVaultInfo);
        expect(newVaultInfo.value).toEqual(
          expect.objectContaining({
            fee: expect.objectContaining({
              formatted: expect.toBeBigDecimalCloseTo(newFee, 4),
            }),
          }),
        );
      }, 30_000);
    });

    describe('When users borrow from the underlying vault reserve', () => {
      // const borrower = createNewWallet();

      it.todo('Then the vault should accrue its fees', () => {
        // const setup = createVault().andThen(deposit(100));
        // assertOk(result);
        // assert vault.totalFeeRevenue
      });
    });

    describe(`When the organization withdraws the vault's fees`, () => {
      it('Then they should receive the expected ERC-20 amount', async () => {
        const initialVault = await createVault(organization)
          .andThen(deposit(user, 1))
          .andThen(mintShares(user, 1))
          .andTee(() => wait(2000));
        assertOk(initialVault);

        // Check vault contains fees
        const vaultInfoBefore = await vault(client, {
          by: { address: initialVault.value.address },
          chainId: initialVault.value.chainId,
        });
        assertOk(vaultInfoBefore);
        expect(
          Number(vaultInfoBefore.value?.totalFeeRevenue.amount.value),
        ).toBeGreaterThan(0);
        const balanceBefore = await getBalance(
          evmAddress(organization.account!.address),
          WETH_ADDRESS,
        );

        const withdrawResult = await vaultWithdrawFees(client, {
          chainId: initialVault.value.chainId,
          vault: initialVault.value.address,
          sendTo: evmAddress(organization.account!.address),
          amount: { max: true },
        })
          .andThen(sendWith(organization))
          .andTee((tx) => console.log(`tx to withdraw fees: ${tx}`))
          .andTee(() => wait(3000)); // wait for the withdraw to be processed
        assertOk(withdrawResult);

        // Check vault contains fees
        const vaultInfoAfter = await vault(client, {
          by: { address: initialVault.value.address },
          chainId: initialVault.value.chainId,
        });
        assertOk(vaultInfoAfter);

        const balanceAfter = await getBalance(
          evmAddress(organization.account!.address),
          WETH_ADDRESS,
        );
        // TODO: check properly the balance of the organization wallet
        expect(balanceAfter).toBeGreaterThan(balanceBefore);
        expect(vaultInfoAfter.value).toEqual(
          expect.objectContaining({
            totalFeeRevenue: expect.objectContaining({
              amount: expect.objectContaining({
                value: expect.toBeBigDecimalCloseTo(0, 18),
              }),
            }),
          }),
        );
      }, 40_000);
    });
  });
});
