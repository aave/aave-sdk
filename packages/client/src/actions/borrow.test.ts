import type {
  MarketUserReserveSupplyPosition,
  SupplyRequest,
} from '@aave/graphql';
import {
  assertOk,
  bigDecimal,
  evmAddress,
  type ResultAsync,
} from '@aave/types';
import type { WalletClient } from 'viem';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
} from '../test-utils';
import { sendWith } from '../viem';
import { borrow, supply } from './transactions';
import { userBorrows, userSupplies } from './user';

function supplyAndFetchPositions(
  wallet: WalletClient,
  request: SupplyRequest,
): ResultAsync<MarketUserReserveSupplyPosition[], Error> {
  const userAddress = evmAddress(wallet.account!.address);
  return supply(client, request)
    .andThen(sendWith(wallet))
    .andThen(client.waitForTransaction)
    .andThen(() =>
      userSupplies(client, {
        markets: [{ address: request.market, chainId: request.chainId }],
        user: userAddress,
      }),
    );
}

describe('Given an Aave Market', () => {
  describe('And a user with a supply position as collateral', () => {
    describe('When the user borrows an ERC20 asset', async () => {
      const user = createNewWallet();

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.011'),
        ).andThen(() =>
          supplyAndFetchPositions(user, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            sender: evmAddress(user.account!.address),
            amount: {
              erc20: {
                currency: ETHEREUM_WETH_ADDRESS,
                value: '0.01',
              },
            },
          }),
        );
        assertOk(setup);
      });

      it(`Then it should be reflected in the user's borrow positions`, async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(user.account!.address)}`);
        const reserve = await fetchReserve(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
        );
        const result = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          sender: evmAddress(user.account!.address),
          amount: {
            erc20: {
              currency: reserve.underlyingToken.address,
              value: reserve.userState!.borrowable.amount.value,
            },
          },
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx to borrow: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userBorrows(client, {
              markets: [
                {
                  address: ETHEREUM_MARKET_ADDRESS,
                  chainId: ETHEREUM_FORK_ID,
                },
              ],
              user: evmAddress(user.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value).toEqual([
          expect.objectContaining({
            debt: expect.objectContaining({
              amount: expect.objectContaining({
                value: expect.toBeBigDecimalCloseTo(
                  reserve.userState!.borrowable.amount.value,
                  5,
                ),
              }),
            }),
          }),
        ]);
      }, 40_000);
    });

    describe('When the user borrows from a reserve that supports native borrowing', async () => {
      const wallet = createNewWallet();

      beforeAll(async () => {
        const setup = await fundNativeAddress(
          evmAddress(wallet.account!.address),
          bigDecimal('0.2'),
        ).andThen(() =>
          supplyAndFetchPositions(wallet, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            sender: evmAddress(wallet.account!.address),
            amount: {
              native: '0.1',
            },
          }),
        );
        assertOk(setup);
      });

      it(`Then it should be reflected in the user's borrow positions`, async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(wallet.account!.address)}`);
        const reserve = await fetchReserve(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(wallet.account!.address),
        );
        const result = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          sender: evmAddress(wallet.account!.address),
          amount: {
            native: reserve.userState!.borrowable.amount.value,
          },
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => annotate(`tx to borrow: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userBorrows(client, {
              markets: [
                {
                  address: ETHEREUM_MARKET_ADDRESS,
                  chainId: ETHEREUM_FORK_ID,
                },
              ],
              user: evmAddress(wallet.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value).toEqual([
          expect.objectContaining({
            debt: expect.objectContaining({
              amount: expect.objectContaining({
                value: expect.toBeBigDecimalCloseTo(
                  reserve.userState!.borrowable.amount.value,
                  5,
                ),
              }),
            }),
          }),
        ]);
      });
    });
  });
});
