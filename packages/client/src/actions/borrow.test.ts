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
  describe('And a user with a supply position', () => {
    describe('When the user set the supply as collateral', async () => {
      const user = createNewWallet();

      it('Then it should be possible to borrow ERC20 from the reserve', async () => {
        // NOTE: first time supply is set as collateral automatically
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.011'),
        ).andThen(() =>
          supplyAndFetchPositions(user, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(user.account!.address),
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
        const reserve = await fetchReserve(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
        );
        const result = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          borrower: evmAddress(user.account!.address),
          amount: {
            erc20: {
              currency: reserve.underlyingToken.address,
              value: reserve.userState!.borrowable.amount.value,
            },
          },
        })
          .andThen(sendWith(user))
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

    describe('When the user set the supply as collateral', async () => {
      const wallet = createNewWallet();

      it('Then it should be possible to borrow native from the reserve', async () => {
        // NOTE: first time supply is set as collateral automatically
        const setup = await fundNativeAddress(
          evmAddress(wallet.account!.address),
          bigDecimal('0.2'),
        ).andThen(() =>
          supplyAndFetchPositions(wallet, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(wallet.account!.address),
            amount: {
              native: '0.1',
            },
          }),
        );
        assertOk(setup);

        // Borrow from the reserve
        const reserve = await fetchReserve(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(wallet.account!.address),
        );
        const result = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          borrower: evmAddress(wallet.account!.address),
          amount: {
            native: reserve.userState!.borrowable.amount.value,
          },
        })
          .andThen(sendWith(wallet))
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
      }, 25_000);
    });
  });
});
