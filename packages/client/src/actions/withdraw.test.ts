import type { Reserve, SupplyRequest } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress, ResultAsync } from '@aave/types';
import type { WalletClient } from 'viem';
import { getBalance } from 'viem/actions';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_USDC_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
  getBalance as getBalanceErc20,
} from '../test-utils';
import { sendWith, signERC20PermitWith } from '../viem';
import { permitTypedData } from './permits';
import { supply, withdraw } from './transactions';
import { userSupplies } from './user';

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
    const wallet = createNewWallet();
    const amountToSupply = '0.1';

    beforeAll(async () => {
      // Fund the wallet with WETH
      await fundErc20Address(
        ETHEREUM_WETH_ADDRESS,
        evmAddress(wallet.account!.address),
        bigDecimal('0.2'),
      );

      await supplyAndCheck(wallet, {
        market: wethReserve.market.address,
        chainId: wethReserve.market.chain.chainId,
        sender: evmAddress(wallet.account!.address),
        amount: {
          erc20: {
            currency: ETHEREUM_WETH_ADDRESS,
            value: amountToSupply,
          },
        },
      });
    });

    describe('When the user withdraws part of their supply', () => {
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
              value: { exact: bigDecimal(Number(amountToSupply) * 0.5) },
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
                  bigDecimal(Number(amountToSupply) * 0.5),
                ),
              }),
            }),
          }),
        ]);
      }, 25_000);
    });

    describe('When the user withdraws all of their supply', () => {
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
      const otherUser = createNewWallet();
      const amountToSupply = '0.1';

      beforeAll(async () => {
        await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.2'),
        );

        await supplyAndCheck(user, {
          market: wethReserve.market.address,
          chainId: wethReserve.market.chain.chainId,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: amountToSupply,
            },
          },
        });
      });

      it(`Then the other address should receive the tokens and it should be reflected in the user's supply positions`, async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(user.account!.address)}`);
        annotate(
          `other user address: ${evmAddress(otherUser.account!.address)}`,
        );

        const result = await withdraw(client, {
          market: wethReserve.market.address,
          sender: evmAddress(user.account!.address),
          recipient: evmAddress(otherUser.account!.address),
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
          evmAddress(otherUser.account!.address),
          ETHEREUM_WETH_ADDRESS,
        );
        expect(balance).toBeCloseTo(Number(amountToSupply), 3);
      });
    });

    describe(`When a relayer is used to withdraw (gasless) with permit signature on the user's aTokens`, () => {
      const user = createNewWallet();
      const relayer = createNewWallet();
      const amountToSupply = '0.1';

      beforeAll(async () => {
        await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.2'),
        );

        await supplyAndCheck(user, {
          market: wethReserve.market.address,
          chainId: wethReserve.market.chain.chainId,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: amountToSupply,
            },
          },
        });
      });

      it('Then the user should receive the tokens and it should be reflected in their supply positions', async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(user.account!.address)}`);
        annotate(`relayer address: ${evmAddress(relayer.account!.address)}`);

        const signature = await permitTypedData(client, {
          market: wethReserve.market.address,
          underlyingToken: wethReserve.underlyingToken.address,
          amount: '0.2', // To make sure the user has enough balance to remove the interest
          chainId: wethReserve.market.chain.chainId,
          spender: evmAddress(relayer.account!.address),
          owner: evmAddress(user.account!.address),
        }).andThen(signERC20PermitWith(user));
        assertOk(signature);

        const result = await withdraw(client, {
          market: usdcReserve.market.address,
          sender: evmAddress(relayer.account!.address),
          amount: {
            native: {
              value: { max: true },
              permitSig: signature.value,
            },
          },
          chainId: wethReserve.market.chain.chainId,
        })
          .andThen(sendWith(relayer))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [wethReserve.market.address],
              user: evmAddress(user.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value).toEqual([]);
      });
    });

    describe('When the user withdraws tokens with a permit signature', () => {
      const user = createNewWallet();
      const amountToSupply = '100';

      beforeAll(async () => {
        const funds = await ResultAsync.combine([
          fundErc20Address(
            ETHEREUM_USDC_ADDRESS,
            evmAddress(user.account!.address),
            bigDecimal('200'),
            6,
          ),
        ]);
        assertOk(funds);

        await supplyAndCheck(user, {
          market: usdcReserve.market.address,
          chainId: usdcReserve.market.chain.chainId,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_USDC_ADDRESS,
              value: amountToSupply,
            },
          },
        });
      });
      it('Then it should allow to withdraw tokens without needing for an ERC20 Approval transaction on the aToken', async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(user.account!.address)}`);

        const signature = await permitTypedData(client, {
          market: usdcReserve.market.address,
          underlyingToken: usdcReserve.underlyingToken.address,
          amount: amountToSupply,
          chainId: usdcReserve.market.chain.chainId,
          spender: evmAddress(user.account!.address),
          owner: evmAddress(user.account!.address),
        }).andThen(signERC20PermitWith(user));
        assertOk(signature);

        const result = await withdraw(client, {
          market: usdcReserve.market.address,
          sender: evmAddress(user.account!.address),
          amount: {
            native: {
              value: { exact: amountToSupply },
              permitSig: signature.value,
            },
          },
          chainId: usdcReserve.market.chain.chainId,
        })
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
      const amount = '0.1';

      beforeAll(async () => {
        // Fund the wallet with WETH
        await fundNativeAddress(
          evmAddress(wallet.account!.address),
          bigDecimal('0.2'),
        );

        await supplyAndCheck(wallet, {
          market: wethReserve.market.address,
          chainId: wethReserve.market.chain.chainId,
          sender: evmAddress(wallet.account!.address),
          amount: {
            native: amount,
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
              value: { exact: amount },
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
