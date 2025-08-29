import {
  assertOk,
  bigDecimal,
  evmAddress,
  type MarketUserReserveSupplyPosition,
  type ResultAsync,
  type SupplyRequest,
} from '@aave/client';
import {
  borrow,
  supply,
  userBorrows,
  userSupplies,
} from '@aave/client/actions';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_USDC_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
} from '@aave/client/test-utils';
import { sendWith } from '@aave/client/viem';
import type { WalletClient } from 'viem';
import { beforeAll, describe, expect, it } from 'vitest';

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
          ETHEREUM_USDC_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('105'),
          6,
        ).andThen(() =>
          supplyAndFetchPositions(user, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            sender: evmAddress(user.account!.address),
            amount: {
              erc20: {
                currency: ETHEREUM_USDC_ADDRESS,
                value: bigDecimal('100'),
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
          ETHEREUM_USDC_ADDRESS,
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
          bigDecimal('0.5'),
        ).andThen(() =>
          supplyAndFetchPositions(wallet, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            sender: evmAddress(wallet.account!.address),
            amount: {
              native: bigDecimal('0.5'),
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
