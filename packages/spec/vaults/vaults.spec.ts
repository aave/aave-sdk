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
  vaultCreateRecipientsConfiguration,
  vaultDeploy,
  vaultDeposit,
  vaultMintShares,
  vaultPreviewDeposit,
  vaultPreviewMint,
  vaultPreviewRedeem,
  vaultPreviewWithdraw,
  vaultRecipientConfiguration,
  vaultRedeemShares,
  vaultSetFee,
  vaultSetRecipientsConfiguration,
  vaults,
  vaultTransferOwnership,
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
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  createVault,
  depositOntoVault,
  mintSharesFromVault,
} from './vault.helpers';

describe('Given the Aave Vaults', () => {
  describe('When an organization deploys a new vault', () => {
    const organization = createNewWallet();
    let initialVault: Vault;

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_WETH_ADDRESS,
        evmAddress(organization.account!.address),
        bigDecimal('0.1'),
      ).andThen(() =>
        vaultDeploy(client, {
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
          deployer: evmAddress(organization.account!.address),
          owner: evmAddress(organization.account!.address),
          initialFee: bigDecimal('10'),
          initialLockDeposit: bigDecimal('0.05'),
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
          .andThen(client.waitForTransaction)
          .andThen((txHash) =>
            vault(client, { by: { txHash }, chainId: ETHEREUM_FORK_ID }),
          )
          .map(nonNullable),
      );
      assertOk(setup);
      initialVault = setup.value;
    });

    it('Then it should be available in the organization vaults', async ({
      annotate,
    }) => {
      annotate(`organization address: ${organization.account!.address}`);
      annotate(`initial vault: ${initialVault.address}`);
      const result = await vaults(client, {
        criteria: {
          ownedBy: [evmAddress(organization.account!.address)],
        },
      });
      assertOk(result);

      expect(result.value.items).toEqual([
        expect.objectContaining({
          owner: organization.account!.address,
          address: initialVault.address,
        }),
      ]);
    });

    it('Then it should set recipients to be 50% organization recipients/50% aave', async ({
      annotate,
    }) => {
      annotate(`organization address: ${organization.account!.address}`);
      annotate(`initial vault: ${initialVault.address}`);
      expect(initialVault.recipients?.entries).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            address: organization.account!.address,
            split: expect.objectContaining({
              formatted: '25.00',
            }),
            isAaveLabs: false,
          }),
          expect.objectContaining({
            address: evmAddress('0x1234567890123456789012345678901234567890'),
            split: expect.objectContaining({
              formatted: '25.00',
            }),
            isAaveLabs: false,
          }),
          expect.objectContaining({
            address: expect.any(String),
            split: expect.objectContaining({
              formatted: '50.00',
            }),
            isAaveLabs: true,
          }),
        ]),
      );
    });
  });

  describe('And a deployed organization vault', () => {
    describe('When the organization wants to manage the vault', () => {
      const organization = createNewWallet();
      let initialVault: Vault;

      beforeEach(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(organization.account!.address),
          bigDecimal('0.1'),
        ).andThen(() =>
          vaultDeploy(client, {
            chainId: ETHEREUM_FORK_ID,
            market: ETHEREUM_MARKET_ADDRESS,
            deployer: evmAddress(organization.account!.address),
            owner: evmAddress(organization.account!.address),
            initialFee: bigDecimal('10'),
            initialLockDeposit: bigDecimal('0.05'),
            shareName: 'Aave WETH Vault Shares',
            shareSymbol: 'avWETH',
            underlyingToken: ETHEREUM_WETH_ADDRESS,
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
          })
            .andThen(sendWith(organization))
            .andThen(client.waitForTransaction)
            .andThen((txHash) =>
              vault(client, { by: { txHash }, chainId: ETHEREUM_FORK_ID }),
            )
            .map(nonNullable),
        );
        assertOk(setup);
        initialVault = setup.value;
      });

      it('Then the organization should be able to transfer the ownership of the vault', async ({
        annotate,
      }) => {
        const newOwner = createNewWallet();
        annotate(`organization address: ${organization.account!.address}`);
        annotate(`initial vault: ${initialVault.address}`);
        annotate(`new owner address: ${newOwner.account!.address}`);

        const transferResult = await vaultTransferOwnership(client, {
          vault: initialVault.address,
          chainId: initialVault.chainId,
          newOwner: evmAddress(newOwner.account!.address),
        })
          .andThen(sendWith(organization))
          .andTee((tx) => annotate(`tx to transfer ownership: ${tx.txHash}`))
          .andThen(client.waitForTransaction);
        assertOk(transferResult);

        const newVaultInfo = await vault(client, {
          by: { address: initialVault.address },
          chainId: initialVault.chainId,
        }).map(nonNullable);

        assertOk(newVaultInfo);
        expect(newVaultInfo.value.owner).toEqual(newOwner.account!.address);
      }, 30_000);

      it('Then the organization should be able to modify the fee of the vault', async ({
        annotate,
      }) => {
        annotate(`organization address: ${organization.account!.address}`);
        const newFee = bigDecimal('50');
        const updateResult = await vaultSetFee(client, {
          chainId: initialVault.chainId,
          vault: initialVault.address,
          newFee: newFee,
        })
          .andThen(sendWith(organization))
          .andTee((tx) => annotate(`tx to set fee: ${tx.txHash}`))
          .andThen(client.waitForTransaction);
        assertOk(updateResult);

        const newVaultInfo = await vault(client, {
          by: { address: initialVault.address },
          chainId: initialVault.chainId,
        }).map(nonNullable);
        assertOk(newVaultInfo);
        expect(newVaultInfo.value.fee.formatted).toEqual('50.00');
      }, 30_000);

      it('Then the organization should be able to modify the recipients of the vault', async ({
        annotate,
      }) => {
        const newRecipient1 = '0x1234567890123456789012345678901234567890';
        const newRecipient2 = '0x1234567890123456789012345678901234567891';
        const newRecipients = [
          {
            address: evmAddress(newRecipient1),
            percent: bigDecimal('50'),
          },
          {
            address: evmAddress(newRecipient2),
            percent: bigDecimal('50'),
          },
        ];

        const updateResult = await vaultCreateRecipientsConfiguration(client, {
          chainId: initialVault.chainId,
          vault: initialVault.address,
          recipients: newRecipients,
        })
          .andThen(sendWith(organization))
          .andTee((tx) => annotate(`tx to create recipients: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen((tx) =>
            vaultRecipientConfiguration(client, {
              by: { txHash: tx },
              chainId: initialVault.chainId,
            }),
          )
          .map(nonNullable)
          .andTee((recipientConfig) =>
            annotate(`recipient config: ${recipientConfig.address}`),
          )
          .andThen((recipientConfig) =>
            vaultSetRecipientsConfiguration(client, {
              vault: initialVault.address,
              chainId: initialVault.chainId,
              configuration: recipientConfig.address,
            }),
          )
          .andThen(sendWith(organization))
          .andTee((tx) => annotate(`tx to set recipients: ${tx.txHash}`))
          .andThen(client.waitForTransaction);
        assertOk(updateResult);

        const newVaultInfo = await vault(client, {
          by: { address: initialVault.address },
          chainId: initialVault.chainId,
        }).map(nonNullable);
        assertOk(newVaultInfo);
        expect(newVaultInfo.value.owner).toEqual(initialVault.owner);
        expect(newVaultInfo.value.recipients?.entries).toMatchSnapshot();
      }, 50_000);
    });

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
            amount: bigDecimal('0.03'),
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
      }, 50_000);
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
      }, 60_000);
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

    describe(`When the organization withdraws the vault's fees`, () => {
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
          .andThen(mintSharesFromVault(user, 0.03))
          .map(nonNullable);
        assertOk(initialVault);

        // Aave recipient is the third one in the list
        const aaveRecipientAddress = nonNullable(
          initialVault.value.recipients?.entries.find(
            (recipient) =>
              recipient.address !== recipient1.account!.address &&
              recipient.address !== recipient2.account!.address,
          ),
        );

        const initialAaveRecipientBalance = await getBalance(
          aaveRecipientAddress.address,
          initialVault.value.usedReserve.aToken.address,
        );

        const vaultAfterWithdraw = await vaultWithdrawFees(client, {
          chainId: initialVault.value.chainId,
          vault: initialVault.value.address,
          amount: { max: true },
        })
          .andThen(sendWith(organization))
          .andTee((tx) => annotate(`tx to withdraw fees: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            vault(client, {
              by: { address: initialVault.value.address },
              chainId: initialVault.value.chainId,
            }),
          );
        assertOk(vaultAfterWithdraw);

        const totalFeeRevenue = Number(
          vaultAfterWithdraw.value?.totalFeeRevenue.amount.value,
        );
        annotate(
          `totalFeeRevenue: ${vaultAfterWithdraw.value?.totalFeeRevenue.amount.raw}`,
        );
        expect(totalFeeRevenue).toBeGreaterThan(0);

        const recipient1Balance = await getBalance(
          evmAddress(recipient1.account!.address),
          initialVault.value?.usedReserve.aToken.address,
        );
        expect(recipient1Balance).toBeCloseTo(totalFeeRevenue * 0.25, 2);

        const recipient2Balance = await getBalance(
          evmAddress(recipient2.account!.address),
          initialVault.value?.usedReserve.aToken.address,
        );
        expect(recipient2Balance).toBeCloseTo(totalFeeRevenue * 0.25, 2);

        const currentAaveRecipientBalance = await getBalance(
          aaveRecipientAddress.address,
          initialVault.value.usedReserve.aToken.address,
        );
        expect(
          currentAaveRecipientBalance - initialAaveRecipientBalance,
        ).toBeCloseTo(totalFeeRevenue * 50, 2);
      }, 50_000);
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
      }, 60_000);

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
        initialFee: 20,
        token: {
          name: 'Aave USDC Vault Shares',
          symbol: 'avUSDC',
          address: ETHEREUM_USDC_ADDRESS,
        },
      }).andThen(mintSharesFromVault(user, 0.03, ETHEREUM_USDC_ADDRESS));
      assertOk(vault1);

      const vault2 = await createVault(organization, {
        initialFee: 15,
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
        listOfVaultsDesc.value.items[0]!.userShares!.shares.amount.raw,
      ).toBeBigDecimalGreaterThan(
        listOfVaultsDesc.value.items[1]!.userShares!.shares.amount.raw,
      );

      const listOfVaultsAsc = await userVaults(client, {
        user: evmAddress(user.account!.address),
        orderBy: { shares: OrderDirection.Asc },
      });

      assertOk(listOfVaultsAsc);
      expect(
        listOfVaultsAsc.value.items[1]!.userShares!.shares.amount.raw,
      ).toBeBigDecimalGreaterThan(
        listOfVaultsAsc.value.items[0]!.userShares!.shares.amount.raw,
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
        listOfVaultsDesc.value.items[0]?.fee.value,
      ).toBeBigDecimalGreaterThan(listOfVaultsDesc.value.items[1]?.fee.value);

      const listOfVaultsAsc = await userVaults(client, {
        user: evmAddress(user.account!.address),
        orderBy: { fee: OrderDirection.Asc },
      });

      assertOk(listOfVaultsAsc);
      expect(
        listOfVaultsAsc.value.items[1]?.fee.value,
      ).toBeBigDecimalGreaterThan(listOfVaultsAsc.value.items[0]?.fee.value);
    });

    it('Then it should be possible so filter them by underlying tokens', async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
      const listOfVaults = await userVaults(client, {
        user: evmAddress(user.account!.address),
        filters: {
          underlyingTokens: [ETHEREUM_USDC_ADDRESS],
        },
      });

      assertOk(listOfVaults);
      expect(listOfVaults.value.items).toEqual([
        expect.objectContaining({
          usedReserve: expect.objectContaining({
            underlyingToken: expect.objectContaining({
              address: ETHEREUM_USDC_ADDRESS,
            }),
          }),
        }),
        expect.objectContaining({
          usedReserve: expect.objectContaining({
            underlyingToken: expect.objectContaining({
              address: ETHEREUM_USDC_ADDRESS,
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
