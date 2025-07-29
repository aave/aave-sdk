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
      const userErc20 = createNewWallet();

      it('Then it should be possible to borrow ERC20 from the reserve', async () => {
        // NOTE: first time supply is set as collateral automatically
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(userErc20.account!.address),
          bigDecimal('0.011'),
        ).andThen(() =>
          onlySupply(userErc20, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(userErc20.account!.address),
            amount: {
              erc20: {
                currency: ETHEREUM_WETH_ADDRESS,
                value: '0.01',
              },
            },
          }),
        );
        assertOk(setup);

        // Borrow from the reserve
        const borrowReserve = await fetchReserve(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(userErc20.account!.address),
        );
        const borrowResult = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          borrower: evmAddress(userErc20.account!.address),
          amount: {
            erc20: {
              currency: borrowReserve.underlyingToken.address,
              value: borrowReserve.userState!.borrowable.amount.value,
            },
          },
        })
          .andThen(sendWith(userErc20))
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
              user: evmAddress(userErc20.account!.address),
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
      const userNative = createNewWallet();

      it('Then it should be possible to borrow native from the reserve', async () => {
        // NOTE: first time supply is set as collateral automatically
        const setup = await fundNativeAddress(
          evmAddress(userNative.account!.address),
          bigDecimal('0.2'),
        ).andThen(() =>
          onlySupply(userNative, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(userNative.account!.address),
            amount: {
              native: '0.1',
            },
          }),
        );
        assertOk(setup);

        // Borrow from the reserve
        const borrowReserve = await fetchReserve(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(userNative.account!.address),
        );
        const borrowResult = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          borrower: evmAddress(userNative.account!.address),
          amount: {
            native: borrowReserve.userState!.borrowable.amount.value,
          },
        })
          .andThen(sendWith(userNative))
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
              user: evmAddress(userNative.account!.address),
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
