import {
  assertOk,
  bigDecimal,
  evmAddress,
  type Reserve,
  type SupplyRequest,
} from '@aave/client';
import {
  permitTypedData,
  supply,
  userSupplies,
  withdraw,
} from '@aave/client/actions';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_USDC_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
  getBalance as getBalanceErc20,
} from '@aave/client/test-utils';
import { sendWith, signERC20PermitWith } from '@aave/client/viem';
import type { WalletClient } from 'viem';
import { getBalance } from 'viem/actions';
import { beforeAll, describe, expect, it } from 'vitest';

async function supplyAndCheck(wallet: WalletClient, request: SupplyRequest) {
  const userAddress = evmAddress(wallet.account!.address);
  const result = await supply(client, request)
    .andThen(sendWith(wallet))
    .andThen(client.waitForTransaction)
    .andThen(() =>
      userSupplies(client, {
        markets: [{ address: request.market, chainId: request.chainId }],
        user: userAddress,
      }),
    );
  assertOk(result);
  expect(result.value).toEqual([
    expect.objectContaining({
      balance: expect.objectContaining({
        amount: expect.objectContaining({
          value: expect.toBeBigDecimalCloseTo(
            'erc20' in request.amount
              ? request.amount.erc20.value
              : request.amount.native,
          ),
        }),
      }),
    }),
  ]);
}

describe('Given an Aave Market', () => {
  let wethReserve: Reserve;
  let usdcReserve: Reserve;

  beforeAll(async () => {
    wethReserve = await fetchReserve(ETHEREUM_WETH_ADDRESS);
    // Check if the reserve is not frozen or paused
    expect(wethReserve.isFrozen).toBe(false);
    expect(wethReserve.isPaused).toBe(false);

    usdcReserve = await fetchReserve(ETHEREUM_USDC_ADDRESS);
    // Check if the reserve is not frozen or paused
    expect(usdcReserve.isFrozen).toBe(false);
    expect(usdcReserve.isPaused).toBe(false);
  });

  describe('And a user with a supply position', () => {
    describe('When the user withdraws part of their supply', () => {
      const wallet = createNewWallet();
      const suppliedAmount = bigDecimal('0.01');

      beforeAll(async () => {
        // Fund the wallet with WETH
        await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(wallet.account!.address),
          bigDecimal('0.05'),
        );

        await supplyAndCheck(wallet, {
          market: wethReserve.market.address,
          chainId: wethReserve.market.chain.chainId,
          sender: evmAddress(wallet.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: suppliedAmount,
            },
          },
        });
      });

      it('Then it should be reflected in the user supply positions', async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(wallet.account!.address)}`);
        const result = await withdraw(client, {
          market: wethReserve.market.address,
          sender: evmAddress(wallet.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: { exact: bigDecimal(Number(suppliedAmount) * 0.5) },
            },
          },
          chainId: wethReserve.market.chain.chainId,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: wethReserve.market.address,
                  chainId: wethReserve.market.chain.chainId,
                },
              ],
              user: evmAddress(wallet.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value).toEqual([
          expect.objectContaining({
            balance: expect.objectContaining({
              amount: expect.objectContaining({
                value: expect.toBeBigDecimalCloseTo(
                  bigDecimal(Number(suppliedAmount) * 0.5),
                ),
              }),
            }),
          }),
        ]);
      }, 25_000);
    });

    describe('When the user withdraws all of their supply', () => {
      const wallet = createNewWallet();
      const suppliedAmount = bigDecimal('0.01');

      beforeAll(async () => {
        // Fund the wallet with WETH
        await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(wallet.account!.address),
          bigDecimal('0.05'),
        );

        await supplyAndCheck(wallet, {
          market: wethReserve.market.address,
          chainId: wethReserve.market.chain.chainId,
          sender: evmAddress(wallet.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: suppliedAmount,
            },
          },
        });
      });

      it('Then it should be reflected in the user supply positions', async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(wallet.account!.address)}`);
        const result = await withdraw(client, {
          market: wethReserve.market.address,
          sender: evmAddress(wallet.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: { max: true },
            },
          },
          chainId: wethReserve.market.chain.chainId,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: wethReserve.market.address,
                  chainId: wethReserve.market.chain.chainId,
                },
              ],
              user: evmAddress(wallet.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value).toEqual([]);
      }, 25_000);
    });
  });

  describe('And a user with a supply position', () => {
    describe('When the user withdraws tokens specifying another address', () => {
      const user = createNewWallet();
      const anotherUser = createNewWallet();
      const suppliedAmount = bigDecimal('0.01');

      beforeAll(async () => {
        await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.05'),
        );

        await supplyAndCheck(user, {
          market: wethReserve.market.address,
          chainId: wethReserve.market.chain.chainId,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: suppliedAmount,
            },
          },
        });
      });

      it(`Then it should be reflected in the user's supply positions and the other address should receive the tokens`, async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(user.account!.address)}`);
        annotate(`other address: ${evmAddress(anotherUser.account!.address)}`);

        const result = await withdraw(client, {
          market: wethReserve.market.address,
          sender: evmAddress(user.account!.address),
          recipient: evmAddress(anotherUser.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: { max: true },
            },
          },
          chainId: wethReserve.market.chain.chainId,
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: wethReserve.market.address,
                  chainId: wethReserve.market.chain.chainId,
                },
              ],
              user: evmAddress(user.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value).toEqual([]);

        const balance = await getBalanceErc20(
          evmAddress(anotherUser.account!.address),
          ETHEREUM_WETH_ADDRESS,
        );
        expect(balance).toBeCloseTo(Number(suppliedAmount), 3);
      });
    });

    // TODO: Only possible to test with WETH reserve and the reserve is not supporting `permit`
    describe.skip('When the user withdraws tokens specifying another address with a permit signature', () => {
      const user = createNewWallet();
      const anotherUser = createNewWallet();
      const suppliedAmount = bigDecimal('0.01');

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.05'),
        );
        assertOk(setup);

        const supplyResult = await supply(client, {
          market: wethReserve.market.address,
          chainId: wethReserve.market.chain.chainId,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: suppliedAmount,
            },
          },
        });
        assertOk(supplyResult);
      });

      it('Then the user should receive the tokens and it should be reflected in their supply positions', async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(user.account!.address)}`);
        annotate(`other address: ${evmAddress(anotherUser.account!.address)}`);

        const result = await permitTypedData(client, {
          currency: ETHEREUM_WETH_ADDRESS,
          amount: bigDecimal('0.2'), // To make sure the user has enough balance to remove the interest
          chainId: ETHEREUM_FORK_ID,
          spender: wethReserve.market.address,
          owner: evmAddress(user.account!.address),
        })
          .andThen(signERC20PermitWith(user))
          .andThen((signature) =>
            withdraw(client, {
              market: wethReserve.market.address,
              sender: evmAddress(user.account!.address),
              recipient: evmAddress(anotherUser.account!.address),
              amount: {
                native: {
                  value: { max: true },
                  permitSig: signature,
                },
              },
              chainId: wethReserve.market.chain.chainId,
            })
              .andThen(sendWith(user))
              .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
              .andThen(client.waitForTransaction)
              .andThen(() =>
                userSupplies(client, {
                  markets: [
                    {
                      address: wethReserve.market.address,
                      chainId: wethReserve.market.chain.chainId,
                    },
                  ],
                  user: evmAddress(user.account!.address),
                }),
              ),
          );
        assertOk(result);
        expect(result.value).toEqual([]);
      });
    });

    // TODO: Only possible to test with WETH reserve and the reserve is not supporting `permit`
    describe.skip('When the user withdraws tokens with a permit signature', () => {
      const user = createNewWallet();
      const suppliedAmount = bigDecimal('100');

      beforeAll(async () => {
        const funds = await fundErc20Address(
          ETHEREUM_USDC_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('200'),
          6,
        );

        assertOk(funds);

        await supplyAndCheck(user, {
          market: usdcReserve.market.address,
          chainId: usdcReserve.market.chain.chainId,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_USDC_ADDRESS,
              value: suppliedAmount,
            },
          },
        });
      });

      it('Then it should allow to withdraw tokens without needing for an ERC20 Approval transaction on the aToken', async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(user.account!.address)}`);

        const signature = await permitTypedData(client, {
          currency: ETHEREUM_USDC_ADDRESS,
          amount: suppliedAmount,
          chainId: ETHEREUM_FORK_ID,
          spender: usdcReserve.market.address,
          owner: evmAddress(user.account!.address),
        }).andThen(signERC20PermitWith(user));
        assertOk(signature);

        const result = await withdraw(client, {
          market: usdcReserve.market.address,
          sender: evmAddress(user.account!.address),
          amount: {
            native: {
              value: { exact: suppliedAmount },
              permitSig: signature.value,
            },
          },
          chainId: usdcReserve.market.chain.chainId,
        })
          .andTee((tx) => expect(tx.__typename).toEqual('TransactionRequest'))
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: usdcReserve.market.address,
                  chainId: usdcReserve.market.chain.chainId,
                },
              ],
              user: evmAddress(user.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value).toEqual([]);
      });
    });
  });

  describe('And the reserve allows withdrawals in native tokens', () => {
    describe('When the user withdraws from the reserve in native tokens', () => {
      const wallet = createNewWallet();
      const suppliedAmount = bigDecimal('0.01');

      beforeAll(async () => {
        // Fund the wallet with WETH
        await fundNativeAddress(
          evmAddress(wallet.account!.address),
          bigDecimal('0.05'),
        );

        await supplyAndCheck(wallet, {
          market: wethReserve.market.address,
          chainId: wethReserve.market.chain.chainId,
          sender: evmAddress(wallet.account!.address),
          amount: {
            native: suppliedAmount,
          },
        });
      });

      it('Then the user should receive the amount in native tokens', async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(wallet.account!.address)}`);
        const balanceBefore = await getBalance(wallet, {
          address: evmAddress(wallet.account!.address),
        });

        const result = await withdraw(client, {
          market: wethReserve.market.address,
          sender: evmAddress(wallet.account!.address),
          amount: {
            native: {
              value: { exact: suppliedAmount },
            },
          },
          chainId: wethReserve.market.chain.chainId,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: wethReserve.market.address,
                  chainId: wethReserve.market.chain.chainId,
                },
              ],
              user: evmAddress(wallet.account!.address),
            }),
          );
        assertOk(result);

        const balanceAfter = await getBalance(wallet, {
          address: evmAddress(wallet.account!.address),
        });
        expect(balanceAfter).toBeGreaterThan(balanceBefore);

        expect(result.value).toEqual([
          expect.objectContaining({
            balance: expect.objectContaining({
              amount: expect.objectContaining({
                value: expect.toBeBigDecimalCloseTo(0),
              }),
            }),
          }),
        ]);
      }, 25_000);
    });
  });
});
