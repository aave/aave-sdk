import { OrderDirection, type Vault } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_USDC_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  getBalance,
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

describe('Given the Aave Vaults', () => {
  describe('When an organization deploys a new vault', () => {
    const organization = createNewWallet();

    it('Then it should be available in the organization vaults', async ({
      annotate,
    }) => {
      const initialVault = await createVault(organization, annotate);
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
      const organization = createNewWallet();
      const user = createNewWallet();

      it(`Then the operation should be reflected in the user's vault positions`, async ({
        annotate,
      }) => {
        const initialVault = await createVault(organization, annotate).andThen(
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

    describe(`When the user mints some vault's shares`, () => {
      const organization = createNewWallet();
      const user = createNewWallet();

      it(`Then the operation should be reflected in the user's vault positions`, async ({
        annotate,
      }) => {
        const initialVault = await createVault(organization, annotate).andThen(
          mintShares(user, 1, annotate),
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

    describe('When the user withdraws their assets from the vault', () => {
      const organization = createNewWallet();
      const user = createNewWallet();

      it(`Then the operation should be reflected in the user's vault positions`, async ({
        annotate,
      }) => {
        const amountToWithdraw = 1.0;
        const initialVault = await createVault(organization, annotate).andThen(
          deposit(user, amountToWithdraw),
        );
        assertOk(initialVault);

        const balanceBefore = await getBalance(
          evmAddress(user.account!.address),
          ETHEREUM_WETH_ADDRESS,
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
          .andTee((tx) => annotate(`tx to withdraw from vault: ${tx.txHash}`))
          .andThen(client.waitForTransaction);
        assertOk(withdrawResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        const balanceAfter = await getBalance(
          evmAddress(user.account!.address),
          ETHEREUM_WETH_ADDRESS,
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
      const organization = createNewWallet();
      const user = createNewWallet();

      it(`Then the operation should be reflected in the user's vault positions`, async ({
        annotate,
      }) => {
        const initialVault = await createVault(organization, annotate).andThen(
          mintShares(user, 1, annotate),
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
          .andTee((tx) => annotate(`tx to redeem shares: ${tx.txHash}`))
          .andThen(client.waitForTransaction);
        assertOk(redeemResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        expect(userPositions.value.items.length).toEqual(0);
      }, 40_000);
    });

    describe('When the user redeems partial amount of their shares', () => {
      const organization = createNewWallet();
      const user = createNewWallet();

      it(`Then the operation should be reflected in the user's vault positions`, async ({
        annotate,
      }) => {
        const initialVault = await createVault(organization, annotate).andThen(
          mintShares(user, 1, annotate),
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
          .andTee((tx) => annotate(`tx to redeem shares: ${tx.txHash}`))
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
      const organization = createNewWallet();

      it('Then the new fee should be reflected in the vault object', async ({
        annotate,
      }) => {
        const initialVault = await createVault(organization, annotate);
        assertOk(initialVault);

        const newFee = bigDecimal('4.60');
        const updateResult = await vaultSetFee(client, {
          chainId: initialVault.value.chainId,
          vault: initialVault.value.address,
          newFee: newFee,
        })
          .andThen(sendWith(organization))
          .andTee((tx) => annotate(`tx to set fee: ${tx.txHash}`))
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

    describe(`When the organization withdraws the vault's fees`, () => {
      const organization = createNewWallet();
      const user = createNewWallet();

      it('Then they should receive the expected ERC-20 amount', async ({
        annotate,
      }) => {
        const initialVault = await createVault(organization, annotate)
          .andThen(deposit(user, 1))
          .andThen(mintShares(user, 1, annotate));
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
          ETHEREUM_WETH_ADDRESS,
        );

        const withdrawResult = await vaultWithdrawFees(client, {
          chainId: initialVault.value.chainId,
          vault: initialVault.value.address,
          sendTo: evmAddress(organization.account!.address),
          amount: { max: true },
        })
          .andThen(sendWith(organization))
          .andTee((tx) => annotate(`tx to withdraw fees: ${tx.txHash}`))
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
          ETHEREUM_WETH_ADDRESS,
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
    const organization = createNewWallet();
    const user = createNewWallet();

    beforeAll(async () => {
      const vault1 = await createVault(organization, undefined, {
        initialFee: 2.0,
        token: {
          name: 'Aave WETH Vault Shares',
          symbol: 'avWETH',
          address: ETHEREUM_WETH_ADDRESS,
        },
      }).andThen(mintShares(user, 10));
      assertOk(vault1);

      const vault2 = await createVault(organization, undefined, {
        initialFee: 5.0,
        token: {
          name: 'Aave USDC Vault Shares',
          symbol: 'avUSDC',
          address: ETHEREUM_USDC_ADDRESS,
        },
      }).andThen(mintShares(user, 5, undefined, ETHEREUM_USDC_ADDRESS));
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
          underlyingTokens: [ETHEREUM_WETH_ADDRESS],
        },
      });

      assertOk(listOfVaults);
      expect(listOfVaults.value.items).toEqual([
        expect.objectContaining({
          usedReserve: expect.objectContaining({
            underlyingToken: expect.objectContaining({
              address: ETHEREUM_WETH_ADDRESS,
            }),
          }),
        }),
      ]);
    });
  });

  describe('And a vault is deployed', () => {
    const user = createNewWallet();
    let vaultInfo: Vault;

    beforeAll(async () => {
      const initialVault = await createVault(user);
      assertOk(initialVault);
      vaultInfo = initialVault.value!;
    });

    describe('When a user previews a deposit into the vault', () => {
      it('Then it should return the expected amount of shares', async () => {
        const previewDepositResult = await vaultPreviewDeposit(client, {
          vault: vaultInfo.address,
          amount: bigDecimal('1'),
          chainId: vaultInfo.chainId,
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

    describe('When a user previews a minting shares from a vault', () => {
      it('Then it should return the expected amount of tokens needed to mint', async () => {
        const previewMintResult = await vaultPreviewMint(client, {
          vault: vaultInfo.address,
          amount: bigDecimal('1'),
          chainId: vaultInfo.chainId,
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

    describe('When a user previews a withdrawal assets from a vault', () => {
      it('Then it should return the expected amount of shares to burn', async () => {
        const previewWithdrawResult = await vaultPreviewWithdraw(client, {
          vault: vaultInfo.address,
          amount: bigDecimal('1'),
          chainId: vaultInfo.chainId,
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

    describe('When a user previews a redeeming shares from a vault', () => {
      it('Then it should return the expected amount of assets to receive', async () => {
        const previewRedeemResult = await vaultPreviewRedeem(client, {
          vault: vaultInfo.address,
          amount: bigDecimal('1'),
          chainId: vaultInfo.chainId,
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
  });
});
