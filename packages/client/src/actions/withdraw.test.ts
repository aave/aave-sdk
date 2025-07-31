import type { Reserve, SupplyRequest } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import type { WalletClient } from 'viem';
import { getBalance } from 'viem/actions';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_WETH_ADDRESS,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
} from '../test-utils';
import { sendWith } from '../viem';
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
  let reserve: Reserve;

  beforeAll(async () => {
    reserve = await fetchReserve(ETHEREUM_WETH_ADDRESS);
    // Check if the reserve is not frozen or paused
    expect(reserve.isFrozen).toBe(false);
    expect(reserve.isPaused).toBe(false);
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
        market: reserve.market.address,
        chainId: reserve.market.chain.chainId,
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
          market: reserve.market.address,
          sender: evmAddress(wallet.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: { exact: bigDecimal(Number(amountToSupply) * 0.5) },
            },
          },
          chainId: reserve.market.chain.chainId,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: reserve.market.address,
                  chainId: reserve.market.chain.chainId,
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
          market: reserve.market.address,
          sender: evmAddress(wallet.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: { max: true },
            },
          },
          chainId: reserve.market.chain.chainId,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: reserve.market.address,
                  chainId: reserve.market.chain.chainId,
                },
              ],
              user: evmAddress(wallet.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value).toEqual([]);
      }, 25_000);
    });

    describe('When the user withdraws tokens specifying another address', () => {
      it.todo(
        `Then the other address should receive the tokens and it should be reflected in the user's supply positions`,
      );
    });

    describe(`When a relayer is used to withdraw (gasless) with permit signature on the user's aTokens`, () => {
      it.todo(
        'Then the user should receive the tokens and it should be reflected in their supply positions',
      );
    });

    describe('When the user withdraws tokens with a permit signature', () => {
      it.todo(
        'Then it should allow to withdraw tokens without needing for an ERC20 Approval transaction on the aToken',
      );
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
          market: reserve.market.address,
          chainId: reserve.market.chain.chainId,
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
          market: reserve.market.address,
          sender: evmAddress(wallet.account!.address),
          amount: {
            native: {
              value: { exact: amount },
            },
          },
          chainId: reserve.market.chain.chainId,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: reserve.market.address,
                  chainId: reserve.market.chain.chainId,
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
