import type {
  Market,
  MarketUserReserveSupplyPosition,
  SupplyRequest,
} from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import type { WalletClient } from 'viem';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  DEFAULT_MARKET_ADDRESS,
  ETHEREUM_FORK_ID,
  fundErc20Address,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import { market } from './markets';
import { borrow, collateralToggle, supply } from './transactions';
import { userBorrows, userSupplies } from './user';

async function supplyAndCheck(
  wallet: WalletClient,
  request: SupplyRequest,
): Promise<MarketUserReserveSupplyPosition[]> {
  const userAddress = evmAddress(wallet.account!.address);
  const result = await supply(client, request)
    .andThen(sendWith(wallet))
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
      // Check if the position can be used as collateral
      canBeCollateral: true,
    }),
  ]);
  return result.value!;
}

describe('Given an Aave Market', () => {
  let marketInfo: Market;
  let initialPosition: MarketUserReserveSupplyPosition | undefined;

  const wallet: WalletClient = createNewWallet();

  beforeAll(async () => {
    // Set up market info first
    const result = await market(client, {
      address: DEFAULT_MARKET_ADDRESS,
      chainId: ETHEREUM_FORK_ID,
    });
    assertOk(result);
    marketInfo = result.value!;

    // Set up wallet and supply position
    await fundErc20Address(
      WETH_ADDRESS,
      evmAddress(wallet.account!.address),
      bigDecimal('0.011'),
    );
    const supplyResult = await supplyAndCheck(wallet, {
      market: marketInfo.address,
      chainId: marketInfo.chain.chainId,
      supplier: evmAddress(wallet.account!.address),
      amount: {
        erc20: {
          currency: WETH_ADDRESS,
          value: '0.01',
        },
      },
    });
    initialPosition = supplyResult[0];
  });

  describe('And a user with a supply position', () => {
    describe('When user set the supply as collateral', async () => {
      it('Then it should be possible to borrow from the reserve', async () => {
        // Enable collateral
        const result = await collateralToggle(client, {
          market: initialPosition!.market.address,
          underlyingToken: initialPosition!.currency.address,
          chainId: initialPosition!.market.chain.chainId,
          user: evmAddress(wallet.account!.address),
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => console.log(`tx to enable collateral: ${tx}`))
          .andThen(() => {
            return userSupplies(client, {
              markets: [
                {
                  address: initialPosition!.market.address,
                  chainId: initialPosition!.market.chain.chainId,
                },
              ],
              user: evmAddress(wallet.account!.address),
            });
          });
        assertOk(result);
        expect(result.value).toEqual([
          expect.objectContaining({
            isCollateral: true,
          }),
        ]);

        // Borrow from the reserve
        const borrowReserve = marketInfo.borrowReserves.find(
          (reserve) => reserve.underlyingToken.symbol === 'USDC',
        )!;
        const borrowResult = await borrow(client, {
          market: marketInfo.address,
          chainId: marketInfo.chain.chainId,
          borrower: evmAddress(wallet.account!.address),
          amount: {
            erc20: {
              currency: borrowReserve.underlyingToken.address,
              value: '10',
            },
          },
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => console.log(`tx to borrow: ${tx}`))
          .andThen(() =>
            userBorrows(client, {
              markets: [
                {
                  address: marketInfo.address,
                  chainId: marketInfo.chain.chainId,
                },
              ],
              user: evmAddress(wallet.account!.address),
            }),
          );
        assertOk(borrowResult);
      });
    });
  });
});
