import {
  assertOk,
  bigDecimal,
  evmAddress,
  nonNullable,
  OrderDirection,
  type Vault,
  VaultUserActivityTimeWindow,
  VaultUserHistoryAction,
} from '@aave/client';
import {
  userVaults,
  vault,
  vaultDeploy,
  vaultDeposit,
  vaultMintShares,
  vaultPreviewDeposit,
  vaultPreviewMint,
  vaultPreviewRedeem,
  vaultPreviewWithdraw,
  vaultRedeemShares,
  vaultSetFee,
  vaults,
  vaultUserActivity,
  vaultUserTransactionHistory,
  vaultWithdraw,
  vaultWithdrawFees,
} from '@aave/client/actions';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_USDC_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fundErc20Address,
  getBalance,
} from '@aave/client/test-utils';
import { sendWith } from '@aave/client/viem';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  createVault,
  depositOntoVault,
  mintSharesFromVault,
} from './vault.helpers';

describe('Given the Aave Vaults', () => {
  describe('When an organization deploys a new vault', () => {
    describe("And is single recipient of the vault's fees", () => {
      const organization = createNewWallet();

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(organization.account!.address),
          bigDecimal('0.1'),
        );
        assertOk(setup);
      });

      it('Then it should be available in the organization vaults', async ({
        annotate,
      }) => {
        annotate(`organization address: ${organization.account!.address}`);
        const initialVault = await vaultDeploy(client, {
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
          deployer: evmAddress(organization.account!.address),
          owner: evmAddress(organization.account!.address),
          initialFee: '3',
          initialLockDeposit: '0.05',
          shareName: 'Aave WETH Vault Shares',
          shareSymbol: 'avWETH',
          underlyingToken: ETHEREUM_WETH_ADDRESS,
        })
          .andThen(sendWith(organization))
          .andTee((tx) => annotate(`tx to deploy vault: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen((txHash) =>
            vault(client, { by: { txHash }, chainId: ETHEREUM_FORK_ID }),
          )
          .map(nonNullable);
        assertOk(initialVault);
        annotate(`initial vault: ${initialVault.value?.address}`);

        expect(initialVault.value.owner).toEqual(
          organization.account!.address.toString(),
        );
        expect(initialVault.value.feeRecipients).toEqual([
          expect.objectContaining({
            address: organization.account!.address,
            percent: expect.objectContaining({
              formatted: '100',
            }),
          }),
        ]);

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

    describe("And has multiple recipient of the vault's fees", () => {
      const organization = createNewWallet();

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(organization.account!.address),
          bigDecimal('0.1'),
        );
        assertOk(setup);
      });

      it('Then it should be available in the organization vaults', async ({
        annotate,
      }) => {
        annotate(`organization address: ${organization.account!.address}`);
        const initialVault = await vaultDeploy(client, {
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
          deployer: evmAddress(organization.account!.address),
          owner: evmAddress(organization.account!.address),
          initialFee: '3',
          initialLockDeposit: '0.05',
          shareName: 'Aave WETH Vault Shares',
          shareSymbol: 'avWETH',
          underlyingToken: ETHEREUM_WETH_ADDRESS,
          recipients: [
            {
              address: evmAddress(organization.account!.address),
              percent: bigDecimal('50'),
            },
            {
              address: evmAddress('0x1234567890123456789012345678901234567890'),
              percent: bigDecimal('50'),
            },
          ],
        })
          .andThen(sendWith(organization))
          .andTee((tx) => annotate(`tx to deploy vault: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen((txHash) =>
            vault(client, { by: { txHash }, chainId: ETHEREUM_FORK_ID }),
          )
          .map(nonNullable);

        assertOk(initialVault);
        annotate(`initial vault: ${initialVault.value?.address}`);

        expect(initialVault.value.owner).toEqual(
          organization.account!.address.toString(),
        );
        expect(initialVault.value.feeRecipients).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              address: organization.account!.address,
              percent: expect.objectContaining({
                formatted: '50.00',
              }),
            }),
            expect.objectContaining({
              address: '0x1234567890123456789012345678901234567890',
              percent: expect.objectContaining({
                formatted: '50.00',
              }),
            }),
          ]),
        );

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
  });

  describe('And a deployed organization vault', () => {
    describe('When a user deposits into the vault', () => {
      const organization = createNewWallet();
      const user = createNewWallet();
      const amountToDeposit = 0.03;

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.1'),
        );
        assertOk(setup);
      });

      it(`Then the operation should be reflected in the user's vault positions`, async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
        annotate(`organization address: ${organization.account!.address}`);
        const initialVault = await createVault(organization);
        assertOk(initialVault);
        annotate(`initial vault: ${initialVault.value?.address}`);
        const depositResult = await vaultDeposit(client, {
          amount: {
            value: bigDecimal(amountToDeposit),
          },
          vault: initialVault.value!.address,
          depositor: evmAddress(user.account!.address),
          chainId: initialVault.value!.chainId,
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx to deposit in vault: ${tx.txHash}`))
          .andThen(client.waitForTransaction);
        assertOk(depositResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });

        assertOk(userPositions);
        expect(userPositions.value.items.length).toEqual(1);
        expect(userPositions.value.items).toEqual([
          expect.objectContaining({
            userShares: expect.objectContaining({
              balance: expect.objectContaining({
                amount: expect.objectContaining({
                  value: expect.toBeBigDecimalCloseTo(amountToDeposit, 4),
                }),
              }),
            }),
          }),
        ]);
      }, 40_000);
    });

    describe(`When the user mints some vault's shares`, () => {
      const organization = createNewWallet();
      const user = createNewWallet();

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.1'),
        );
        assertOk(setup);
      });

      it(`Then the operation should be reflected in the user's vault positions`, async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
        annotate(`organization address: ${organization.account!.address}`);
        const initialVault = await createVault(organization);
        assertOk(initialVault);
        annotate(`initial vault address: ${initialVault.value?.address}`);
        const mintResult = await vaultMintShares(client, {
          shares: {
            amount: '0.03',
          },
          vault: initialVault.value!.address,
          minter: evmAddress(user.account!.address),
          chainId: initialVault.value!.chainId,
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx to mint shares: ${tx.txHash}`))
          .andThen(client.waitForTransaction);
        assertOk(mintResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        expect(userPositions.value.items).toEqual([
          expect.objectContaining({
            userShares: expect.objectContaining({
              shares: expect.objectContaining({
                amount: expect.objectContaining({
                  value: expect.toBeBigDecimalCloseTo(0.03, 4),
                }),
              }),
            }),
          }),
        ]);
      }, 50_000);
    });

    describe('When the user withdraws their assets from the vault', () => {
      const organization = createNewWallet();
      const user = createNewWallet();

      it(`Then the operation should be reflected in the user's vault positions`, async ({
        annotate,
      }) => {
        const amountToWithdraw = 0.02;
        const initialVault = await createVault(organization).andThen(
          depositOntoVault(user, amountToWithdraw),
        );
        assertOk(initialVault);

        const balanceBefore = await getBalance(
          evmAddress(user.account!.address),
          ETHEREUM_WETH_ADDRESS,
        );

        const withdrawResult = await vaultWithdraw(client, {
          chainId: initialVault.value?.chainId,
          sharesOwner: evmAddress(user.account!.address),
          amount: {
            value: bigDecimal(amountToWithdraw.toString()),
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
        expect(balanceAfter).toBeCloseTo(balanceBefore + amountToWithdraw, 4);
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
        annotate(`user address: ${user.account!.address}`);
        annotate(`organization address: ${organization.account!.address}`);
        const initialVault = await createVault(organization).andThen(
          mintSharesFromVault(user, 0.03),
        );
        assertOk(initialVault);

        const redeemResult = await vaultRedeemShares(client, {
          shares: {
            amount: bigDecimal('0.03'),
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
        annotate(`user address: ${user.account!.address}`);
        annotate(`organization address: ${organization.account!.address}`);
        const initialVault = await createVault(organization).andThen(
          mintSharesFromVault(user, 0.05),
        );
        assertOk(initialVault);

        const redeemResult = await vaultRedeemShares(client, {
          shares: {
            amount: bigDecimal('0.03'),
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
                  value: expect.toBeBigDecimalCloseTo(0.02, 4),
                }),
              }),
            }),
          }),
        ]);
      }, 50_000);
    });

    describe(`When the organization changes the vault's fee`, () => {
      describe("And is single recipient of the vault's fees", () => {
        const organization = createNewWallet();

        it('Then the new fee should be reflected in the vault object', async ({
          annotate,
        }) => {
          annotate(`organization address: ${organization.account!.address}`);
          const initialVault = await createVault(organization);
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

      describe('And vault has multiple recipient of the fee', () => {
        const organization = createNewWallet();

        it('Then the new fee should be reflected in the vault object', async ({
          annotate,
        }) => {
          annotate(`organization address: ${organization.account!.address}`);
          const initialVault = await createVault(organization, {
            recipients: [
              {
                address: evmAddress(organization.account!.address),
                percent: bigDecimal('50'),
              },
              {
                address: evmAddress(
                  '0x1234567890123456789012345678901234567890',
                ),
                percent: bigDecimal('50'),
              },
            ],
          });
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
    });

    describe(`When the organization withdraws the vault's fees`, () => {
      describe("And is single recipient of the vault's fees", () => {
        const organization = createNewWallet();
        const user = createNewWallet();

        it('Then they should receive the expected ERC-20 amount', async ({
          annotate,
        }) => {
          annotate(`user address: ${user.account!.address}`);
          annotate(`organization address: ${organization.account!.address}`);
          const initialVault = await createVault(organization)
            .andThen(depositOntoVault(user, 0.03))
            .andThen(mintSharesFromVault(user, 0.03));
          assertOk(initialVault);

          // Check vault contains fees
          const vaultInfoBefore = await vault(client, {
            by: { address: initialVault.value.address },
            chainId: initialVault.value.chainId,
          });
          assertOk(vaultInfoBefore);
          annotate(
            `totalFeeRevenue: ${Number(
              vaultInfoBefore.value?.totalFeeRevenue.amount.value,
            )}`,
          );
          expect(
            Number(vaultInfoBefore.value?.totalFeeRevenue.amount.value),
          ).toBeGreaterThan(0);
          const balanceBefore = await getBalance(
            evmAddress(organization.account!.address),
            initialVault.value?.usedReserve.aToken.address,
          );
          annotate(`balance before: ${balanceBefore}`);
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

          const balanceAfter = await getBalance(
            evmAddress(organization.account!.address),
            initialVault.value?.usedReserve.aToken.address,
          );
          annotate(`balance after: ${balanceAfter}`);
          expect(balanceAfter * 10 ** 18).toBeGreaterThan(
            balanceBefore * 10 ** 18,
          );
        }, 50_000);
      });

      describe('And vault has multiple recipient of the fee', () => {
        const organization = createNewWallet();
        const user = createNewWallet();
        const recipient1 = createNewWallet();
        const recipient2 = createNewWallet();

        it('Then all recipients should receive the expected ERC-20 amount', async ({
          annotate,
        }) => {
          annotate(`user address: ${user.account!.address}`);
          annotate(`organization address: ${organization.account!.address}`);

          const initialVault = await createVault(organization, {
            recipients: [
              {
                address: evmAddress(recipient1.account!.address),
                percent: bigDecimal('50'),
              },
              {
                address: evmAddress(recipient2.account!.address),
                percent: bigDecimal('50'),
              },
            ],
          })
            .andTee((vault) => annotate(`vault: ${vault.address}`))
            .andThen(depositOntoVault(user, 0.03))
            .andThen(mintSharesFromVault(user, 0.03));
          assertOk(initialVault);

          const withdrawResult = await vaultWithdrawFees(client, {
            chainId: initialVault.value.chainId,
            vault: initialVault.value.address,
            amount: { max: true },
          })
            .andThen(sendWith(organization))
            .andTee((tx) => annotate(`tx to withdraw fees: ${tx.txHash}`))
            .andThen(client.waitForTransaction);
          assertOk(withdrawResult);

          const vaultInfoBefore = await vault(client, {
            by: { address: initialVault.value.address },
            chainId: initialVault.value.chainId,
          });
          assertOk(vaultInfoBefore);

          const totalFeeRevenue = Number(
            vaultInfoBefore.value?.totalFeeRevenue.amount.value,
          );
          annotate(
            `totalFeeRevenue: ${vaultInfoBefore.value?.totalFeeRevenue.amount.raw}`,
          );
          expect(totalFeeRevenue).toBeGreaterThan(0);

          const recipient1Balance = await getBalance(
            evmAddress(recipient1.account!.address),
            initialVault.value?.usedReserve.aToken.address,
          );
          expect(recipient1Balance).toBeCloseTo(totalFeeRevenue / 2, 1);

          const recipient2Balance = await getBalance(
            evmAddress(recipient2.account!.address),
            initialVault.value?.usedReserve.aToken.address,
          );
          expect(recipient2Balance).toBeCloseTo(totalFeeRevenue / 2, 1);
        }, 50_000);
      });
    });

    describe('When the user redeems partial amount of their shares', () => {
      const organization = createNewWallet();
      const user = createNewWallet();
      let vault: Vault;

      beforeAll(async () => {
        const initialVault = await createVault(organization).andThen(
          mintSharesFromVault(user, 0.05),
        );
        assertOk(initialVault);
        vault = initialVault.value!;
        const redeemResult = await vaultRedeemShares(client, {
          shares: {
            amount: bigDecimal('0.03'),
          },
          vault: initialVault.value!.address,
          chainId: initialVault.value!.chainId,
          sharesOwner: evmAddress(user.account!.address),
        })
          .andThen(sendWith(user))
          .andThen(client.waitForTransaction);
        assertOk(redeemResult);
      });

      const timeWindows = Object.values(VaultUserActivityTimeWindow);
      it.each(timeWindows)(
        `Then the user's vault activity can be fetched for the time window %s`,
        async (window) => {
          const result = await vaultUserActivity(client, {
            vault: vault.address,
            chainId: vault.chainId,
            user: evmAddress(user.account!.address),
            window: window,
          });
          assertOk(result);
          expect(result.value).toMatchSnapshot({
            earned: {
              amount: {
                value: expect.toBeBigDecimalCloseTo(0.03, 4),
                raw: expect.any(String),
              },
              usd: expect.any(String),
              usdPerToken: expect.any(String),
            },
            breakdown: [
              {
                balance: {
                  amount: {
                    value: expect.toBeBigDecimalCloseTo(0.02, 4),
                    raw: expect.any(String),
                  },
                  usd: expect.any(String),
                  usdPerToken: expect.any(String),
                },
                date: expect.any(String),
                earned: {
                  amount: {
                    value: expect.toBeBigDecimalCloseTo(0.03, 4),
                    raw: expect.any(String),
                  },
                  usd: expect.any(String),
                  usdPerToken: expect.any(String),
                },
                deposited: {
                  usd: expect.any(String),
                  usdPerToken: expect.any(String),
                },
                withdrew: {
                  usd: expect.any(String),
                  usdPerToken: expect.any(String),
                },
              },
            ],
          });
        },
      );

      it(`Then the operations should be reflected in the user's vault transaction history`, async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
        annotate(`vault address: ${vault.address}`);

        const txHistory = await vaultUserTransactionHistory(client, {
          chainId: vault.chainId,
          vault: vault.address,
          user: evmAddress(user.account!.address),
        });
        assertOk(txHistory);
        expect(txHistory.value.items.length).toEqual(2);
      });

      it(`Then the user's vault transaction history can be filtered by action`, async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
        annotate(`vault address: ${vault.address}`);

        const txHistoryDeposit = await vaultUserTransactionHistory(client, {
          chainId: vault.chainId,
          vault: vault.address,
          user: evmAddress(user.account!.address),
          filter: [VaultUserHistoryAction.Deposit],
        });
        assertOk(txHistoryDeposit);
        txHistoryDeposit.value.items.forEach((item) => {
          expect(item.__typename).toEqual('VaultUserDepositItem');
        });

        const txHistoryWithdraw = await vaultUserTransactionHistory(client, {
          chainId: vault.chainId,
          vault: vault.address,
          user: evmAddress(user.account!.address),
          filter: [VaultUserHistoryAction.Withdraw],
        });
        assertOk(txHistoryWithdraw);
        txHistoryWithdraw.value.items.forEach((item) => {
          expect(item.__typename).toEqual('VaultUserWithdrawItem');
        });
      });

      it(`Then the user's vault transaction history can be sorted by date`, async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
        annotate(`vault address: ${vault.address}`);

        const txHistory = await vaultUserTransactionHistory(client, {
          chainId: vault.chainId,
          vault: vault.address,
          user: evmAddress(user.account!.address),
          orderBy: { date: OrderDirection.Desc },
        });
        assertOk(txHistory);
        // Check that the transactions are sorted by date in descending order
        expect(txHistory.value.items).toEqual(
          txHistory.value.items.sort((a, b) => {
            return (
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
          }),
        );
      });
    });
  });

  describe('When a user lists all the vaults they have a position in', () => {
    const organization = createNewWallet();
    const user = createNewWallet();

    beforeAll(async () => {
      const vault1 = await createVault(organization, {
        initialFee: 2.0,
      }).andThen(mintSharesFromVault(user, 0.03));
      assertOk(vault1);

      const vault2 = await createVault(organization, {
        initialFee: 5.0,
        token: {
          name: 'Aave USDC Vault Shares',
          symbol: 'avUSDC',
          address: ETHEREUM_USDC_ADDRESS,
        },
      }).andThen(mintSharesFromVault(user, 1, ETHEREUM_USDC_ADDRESS));
      assertOk(vault2);
    }, 60_000);

    it('Then it should be possible so sort them by the amount of shares they have', async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
      const listOfVaultsDesc = await userVaults(client, {
        user: evmAddress(user.account!.address),
        orderBy: { shares: OrderDirection.Desc },
      });

      assertOk(listOfVaultsDesc);
      expect(
        Number(
          listOfVaultsDesc.value.items[0]?.userShares?.shares.amount.value *
            listOfVaultsDesc.value.items[0]?.userShares?.shares.usdPerToken,
        ),
      ).toBeGreaterThanOrEqual(
        Number(
          listOfVaultsDesc.value.items[1]?.userShares?.shares.amount.value *
            listOfVaultsDesc.value.items[1]?.userShares?.shares.usdPerToken,
        ),
      );

      const listOfVaultsAsc = await userVaults(client, {
        user: evmAddress(user.account!.address),
        orderBy: { shares: OrderDirection.Asc },
      });

      assertOk(listOfVaultsAsc);
      expect(
        Number(
          listOfVaultsAsc.value.items[0]?.userShares?.shares.amount.value *
            listOfVaultsAsc.value.items[0]?.userShares?.shares.usdPerToken,
        ),
      ).toBeLessThanOrEqual(
        Number(
          listOfVaultsAsc.value.items[1]?.userShares?.shares.amount.value *
            listOfVaultsAsc.value.items[1]?.userShares?.shares.usdPerToken,
        ),
      );
    });

    it(`Then it should be possible so sort them by Vault's fee`, async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
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

    it('Then it should be possible so filter them by underlying tokens', async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
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
      it('Then it should return the expected amount of shares', async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
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
      it('Then it should return the expected amount of tokens needed to mint', async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
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
      it('Then it should return the expected amount of shares to burn', async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
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
      it('Then it should return the expected amount of assets to receive', async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
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
