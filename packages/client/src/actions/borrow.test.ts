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
  ETHEREUM_USDC_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
} from '../test-utils';
import { sendWith, signERC20PermitWith } from '../viem';
import { permitTypedData } from './permits';
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
      });

      it(`Then it should be reflected in the user's borrow positions`, async () => {
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
            supplier: evmAddress(wallet.account!.address),
            amount: {
              native: '0.1',
            },
          }),
        );
        assertOk(setup);
      });

      it(`Then it should be reflected in the user's borrow positions`, async () => {
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
      });
    });
  });

  describe('And a supply position marked as collateral', () => {
    describe('When a user borrows against that supply position via a permit signature', () => {
      const owner = createNewWallet();
      const user = createNewWallet();

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_USDC_ADDRESS,
          evmAddress(owner.account!.address),
          bigDecimal('100'),
        ).andThen(() =>
          supplyAndFetchPositions(owner, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(owner.account!.address),
            amount: {
              erc20: {
                currency: ETHEREUM_USDC_ADDRESS,
                value: '100',
              },
            },
          }),
        );
        assertOk(setup);
      });

      it(`Then it should be reflected in the owner's borrow positions`, async () => {
        const reserve = await fetchReserve(
          ETHEREUM_USDC_ADDRESS,
          evmAddress(owner.account!.address),
        );
        expect(reserve.permitSupported).toBe(true);

        const signature = await permitTypedData(client, {
          market: reserve.market.address,
          underlyingToken: reserve.underlyingToken.address,
          amount: reserve.userState!.borrowable.amount.value,
          chainId: reserve.market.chain.chainId,
          spender: evmAddress(user.account!.address),
          owner: evmAddress(owner.account!.address),
        }).andThen(signERC20PermitWith(user));
        assertOk(signature);

        const result = await borrow(client, {
          market: reserve.market.address,
          borrower: evmAddress(user.account!.address),
          amount: {
            erc20: {
              value: reserve.userState!.borrowable.amount.value,
              currency: reserve.underlyingToken.address,
              erc712: signature.value,
            },
          },
          chainId: reserve.market.chain.chainId,
        })
          .andThen(sendWith(owner))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userBorrows(client, {
              markets: [reserve.market.address],
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
      });
    });
  });
});
