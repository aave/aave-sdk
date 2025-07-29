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
import { describe, expect, it } from 'vitest';
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

function onlySupply(
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
  describe('And a user with a supply position', () => {
    describe('When the user set the supply as collateral', async () => {
      const userBorrowErc20 = createNewWallet();

      it('Then it should be possible to borrow ERC20 from the reserve', async () => {
        // NOTE: first time supply is set as collateral automatically
        const setup = await fundErc20Address(
          WETH_ADDRESS,
          evmAddress(userBorrowErc20.account!.address),
          bigDecimal('0.011'),
        ).andThen(() =>
          onlySupply(userBorrowErc20, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(userBorrowErc20.account!.address),
            amount: {
              erc20: {
                currency: WETH_ADDRESS,
                value: '0.01',
              },
            },
          }),
        );
        assertOk(setup);

        // Borrow from the reserve
        const borrowReserve = await fetchReserve(
          WETH_ADDRESS,
          evmAddress(userBorrowErc20.account!.address),
        );
        const borrowResult = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          borrower: evmAddress(userBorrowErc20.account!.address),
          amount: {
            erc20: {
              currency: borrowReserve.underlyingToken.address,
              value: borrowReserve.userState!.borrowable.amount.value,
            },
          },
        })
          .andThen(sendWith(userBorrowErc20))
          .andTee((tx) => console.log(`tx to borrow: ${tx}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userBorrows(client, {
              markets: [
                {
                  address: ETHEREUM_MARKET_ADDRESS,
                  chainId: ETHEREUM_FORK_ID,
                },
              ],
              user: evmAddress(userBorrowErc20.account!.address),
            }),
          );
        assertOk(borrowResult);
        expect(borrowResult.value).toEqual([
          expect.objectContaining({
            debt: expect.objectContaining({
              amount: expect.objectContaining({
                value: expect.toBeBigDecimalCloseTo(
                  borrowReserve.userState!.borrowable.amount.value,
                  5,
                ),
              }),
            }),
          }),
        ]);
      }, 25_000);
    });

    describe('When the user set the supply as collateral', async () => {
      const userBorrowNative = createNewWallet();

      it('Then it should be possible to borrow native from the reserve', async () => {
        // NOTE: first time supply is set as collateral automatically
        const setup = await fundNativeAddress(
          evmAddress(userBorrowNative.account!.address),
          bigDecimal('0.2'),
        ).andThen(() =>
          onlySupply(userBorrowNative, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(userBorrowNative.account!.address),
            amount: {
              native: '0.1',
            },
          }),
        );
        assertOk(setup);

        // Borrow from the reserve
        const borrowReserve = await fetchReserve(
          WETH_ADDRESS,
          evmAddress(userBorrowNative.account!.address),
        );
        const borrowResult = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          borrower: evmAddress(userBorrowNative.account!.address),
          amount: {
            native: borrowReserve.userState!.borrowable.amount.value,
          },
        })
          .andThen(sendWith(userBorrowNative))
          .andTee((tx) => console.log(`tx to borrow: ${tx}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userBorrows(client, {
              markets: [
                {
                  address: ETHEREUM_MARKET_ADDRESS,
                  chainId: ETHEREUM_FORK_ID,
                },
              ],
              user: evmAddress(userBorrowNative.account!.address),
            }),
          );
        assertOk(borrowResult);
        expect(borrowResult.value).toEqual([
          expect.objectContaining({
            debt: expect.objectContaining({
              amount: expect.objectContaining({
                value: expect.toBeBigDecimalCloseTo(
                  borrowReserve.userState!.borrowable.amount.value,
                  5,
                ),
              }),
            }),
          }),
        ]);
      }, 25_000);
    });
  });
});
