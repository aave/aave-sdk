import { OrderDirection } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  getBalance,
  USDC_ADDRESS,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import {
  vaultRedeemShares,
  vaultSetFee,
  vaultWithdraw,
  vaultWithdrawFees,
} from './transactions';
import { createVault, deposit, mintShares } from './vault.helpers';
import {
  userVaults,
  vault,
  vaultPreviewDeposit,
  vaultPreviewMint,
  vaultPreviewRedeem,
  vaultPreviewWithdraw,
  vaults,
} from './vaults';

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
        const initialVault = await createVault(organization).andThen(
          deposit(user, 1),
        );
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

    describe('When a user previews a deposit into the vault', () => {
      it('Then it should return the expected amount of shares', async () => {
        const initialVault = await createVault(organization);
        assertOk(initialVault);

        const previewDepositResult = await vaultPreviewDeposit(client, {
          vault: initialVault.value!.address,
          amount: bigDecimal('1'),
          chainId: initialVault.value!.chainId,
        });
        assertOk(previewDepositResult);
        expect(previewDepositResult.value).toEqual(
          expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeBigDecimalCloseTo(1, 4),
            }),
          }),
        );
      });
    });

    describe(`When the user mints some vault's shares`, () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault(organization).andThen(
          mintShares(user, 1),
        );
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

    describe('When a user previews a minting shares from a vault', () => {
      it('Then it should return the expected amount of tokens needed to mint', async () => {
        const initialVault = await createVault(organization);
        assertOk(initialVault);

        const previewMintResult = await vaultPreviewMint(client, {
          vault: initialVault.value!.address,
          amount: bigDecimal('1'),
          chainId: initialVault.value!.chainId,
        });
        assertOk(previewMintResult);
        expect(previewMintResult.value).toEqual(
          expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeBigDecimalCloseTo(1, 4),
            }),
          }),
        );
      });
    });

    describe('When the user withdraws their assets from the vault', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const amountToWithdraw = 1.0;
        const initialVault = await createVault(organization).andThen(
          deposit(user, amountToWithdraw),
        );
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
          .andThen(client.waitForTransaction);
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

    describe('When a user previews a withdrawal assets from a vault', () => {
      it('Then it should return the expected amount of shares to burn', async () => {
        const initialVault = await createVault(organization);
        assertOk(initialVault);

        const previewWithdrawResult = await vaultPreviewWithdraw(client, {
          vault: initialVault.value!.address,
          amount: bigDecimal('1'),
          chainId: initialVault.value!.chainId,
        });
        assertOk(previewWithdrawResult);
        expect(previewWithdrawResult.value).toEqual(
          expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeBigDecimalCloseTo(1, 4),
            }),
          }),
        );
      });
    });

    describe('When the user redeems total amount of their shares', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault(organization).andThen(
          mintShares(user, 1),
        );
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
          .andThen(client.waitForTransaction);
        assertOk(redeemResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        expect(userPositions.value.items.length).toEqual(0);
      }, 40_000);
    });

    describe('When a user previews a redeeming shares from a vault', () => {
      it('Then it should return the expected amount of assets to receive', async () => {
        const initialVault = await createVault(organization);
        assertOk(initialVault);

        const previewRedeemResult = await vaultPreviewRedeem(client, {
          vault: initialVault.value!.address,
          amount: bigDecimal('1'),
          chainId: initialVault.value!.chainId,
        });
        assertOk(previewRedeemResult);
        expect(previewRedeemResult.value).toEqual(
          expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeBigDecimalCloseTo(1, 4),
            }),
          }),
        );
      });
    });

    describe('When the user redeems partial amount of their shares', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault(organization).andThen(
          mintShares(user, 1),
        );
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
          .andThen(client.waitForTransaction);
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
          .andThen(client.waitForTransaction);
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
          .andThen(mintShares(user, 1));
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
          .andThen(client.waitForTransaction);
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

  describe('When a user lists all the vaults they have a position in', () => {
    beforeAll(async () => {
      const vault1 = await createVault(organization, {
        initialFee: 2.0,
        token: {
          name: 'Aave WETH Vault Shares',
          symbol: 'avWETH',
          address: WETH_ADDRESS,
        },
      }).andThen(mintShares(user, 10));
      assertOk(vault1);

      const vault2 = await createVault(organization, {
        initialFee: 5.0,
        token: {
          name: 'Aave USDC Vault Shares',
          symbol: 'avUSDC',
          address: USDC_ADDRESS,
        },
      }).andThen(mintShares(user, 5, USDC_ADDRESS));
      assertOk(vault2);
    }, 60_000);

    it('Then it should be possible so sort them by the amount of shares they have', async () => {
      const listOfVaultsDesc = await userVaults(client, {
        user: evmAddress(user.account!.address),
        orderBy: { shares: OrderDirection.Desc },
      });

      assertOk(listOfVaultsDesc);
      expect(
        Number(
          listOfVaultsDesc.value.items[0]?.userShares?.shares.amount.value,
        ),
      ).toBeGreaterThanOrEqual(
        Number(
          listOfVaultsDesc.value.items[1]?.userShares?.shares.amount.value,
        ),
      );

      const listOfVaultsAsc = await userVaults(client, {
        user: evmAddress(user.account!.address),
        orderBy: { shares: OrderDirection.Asc },
      });

      assertOk(listOfVaultsAsc);
      expect(
        Number(listOfVaultsAsc.value.items[0]?.userShares?.shares.amount.value),
      ).toBeLessThanOrEqual(
        Number(listOfVaultsAsc.value.items[1]?.userShares?.shares.amount.value),
      );
    });

    it(`Then it should be possible so sort them by Vault's fee`, async () => {
      const listOfVaultsDesc = await userVaults(client, {
        user: evmAddress(user.account!.address),
        orderBy: { fee: OrderDirection.Desc },
      });

      assertOk(listOfVaultsDesc);
      expect(
        Number(listOfVaultsDesc.value.items[0]?.fee.value),
      ).toBeGreaterThanOrEqual(
        Number(listOfVaultsDesc.value.items[1]?.fee.value),
      );

      const listOfVaultsAsc = await userVaults(client, {
        user: evmAddress(user.account!.address),
        orderBy: { fee: OrderDirection.Asc },
      });

      assertOk(listOfVaultsAsc);
      expect(
        Number(listOfVaultsAsc.value.items[0]?.fee.value),
      ).toBeLessThanOrEqual(Number(listOfVaultsAsc.value.items[1]?.fee.value));
    });

    it('Then it should be possible so filter them by underlying tokens', async () => {
      const listOfVaults = await userVaults(client, {
        user: evmAddress(user.account!.address),
        filters: {
          underlyingTokens: [WETH_ADDRESS],
        },
      });

      assertOk(listOfVaults);
      expect(listOfVaults.value.items).toEqual([
        expect.objectContaining({
          usedReserve: expect.objectContaining({
            underlyingToken: expect.objectContaining({
              address: WETH_ADDRESS,
            }),
          }),
        }),
      ]);
    });
  });
});
