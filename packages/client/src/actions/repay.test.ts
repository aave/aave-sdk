import type { Market, SupplyRequest } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import type { WalletClient } from 'viem';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fundErc20Address,
  fundNativeAddress,
} from '../test-utils';
import { sendWith } from '../viem';
import { market } from './markets';
import { reserve } from './reserve';
import { borrow, repay, supply } from './transactions';
import { userBorrows } from './user';

async function supplyAndBorrow(wallet: WalletClient, request: SupplyRequest) {
  const userAddress = evmAddress(wallet.account!.address);
  const result = await supply(client, request)
    .andThen(sendWith(wallet))
    .andTee((tx) => console.log(`Supplied tx: ${tx}`))
    .andThen(client.waitForTransaction)
    .andThen(() =>
      reserve(client, {
        market: request.market,
        user: userAddress,
        chainId: request.chainId,
        underlyingToken:
          'erc20' in request.amount ? request.amount.erc20.currency : undefined,
      }),
    )
    .andThen((reserve) =>
      borrow(client, {
        market: reserve?.market.address,
        amount: {
          erc20: {
            currency: reserve?.underlyingToken.address,
            value: reserve?.userState?.borrowable.amount.value,
          },
        },
        borrower: userAddress,
        chainId: request.chainId,
      }),
    )
    .andThen(sendWith(wallet))
    .andTee((tx) => console.log(`Borrowed tx: ${tx}`))
    .andThen(client.waitForTransaction);
  assertOk(result);
}

describe('Given an Aave Market', () => {
  describe('And a user with a borrow position', () => {
    describe('When the user repays their loan', () => {
      let marketInfo: Market;
      const wallet = createNewWallet();

      beforeAll(async () => {
        // Set up market info first
        const result = await market(client, {
          address: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
        });
        assertOk(result);
        marketInfo = result.value!;

        // Set up wallet and supply position
        await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(wallet.account!.address),
          bigDecimal('0.02'),
        );

        // supply and borrow
        await supplyAndBorrow(wallet, {
          market: marketInfo.address,
          chainId: marketInfo.chain.chainId,
          supplier: evmAddress(wallet.account!.address),
          amount: { erc20: { currency: ETHEREUM_WETH_ADDRESS, value: '0.01' } },
        });
      }, 30_000);

      it('Then it should be reflected in the user borrow positions', async () => {
        const result = await repay(client, {
          amount: { erc20: { currency: ETHEREUM_WETH_ADDRESS, value: '0.01' } },
          borrower: evmAddress(wallet.account!.address),
          chainId: marketInfo.chain.chainId,
          market: marketInfo.address,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => console.log(`Repaid tx: ${tx}`))
          .andThen(client.waitForTransaction)
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
        assertOk(result);
        expect(result.value.length).toBe(0);
      }, 25_000);
    });

    describe('And the reserve allows repaying in native tokens', () => {
      describe('When the user repays their loan in native tokens', () => {
        let marketInfo: Market;
        const wallet = createNewWallet();

        beforeAll(async () => {
          // Set up market info first
          const result = await market(client, {
            address: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
          });
          assertOk(result);
          marketInfo = result.value!;

          // Set up wallet and supply position
          await fundNativeAddress(
            evmAddress(wallet.account!.address),
            bigDecimal('0.02'),
          );

          await fundErc20Address(
            ETHEREUM_WETH_ADDRESS,
            evmAddress(wallet.account!.address),
            bigDecimal('0.02'),
          );

          // supply and borrow
          await supplyAndBorrow(wallet, {
            market: marketInfo.address,
            chainId: marketInfo.chain.chainId,
            supplier: evmAddress(wallet.account!.address),
            amount: {
              erc20: { currency: ETHEREUM_WETH_ADDRESS, value: '0.01' },
            },
          });
        }, 30_000);

        it('Then it should be reflected in the user borrow positions', async () => {
          const result = await repay(client, {
            amount: { native: '0.01' },
            borrower: evmAddress(wallet.account!.address),
            chainId: marketInfo.chain.chainId,
            market: marketInfo.address,
          })
            .andThen(sendWith(wallet))
            .andTee((tx) => console.log(`Repaid tx: ${tx}`))
            .andThen(client.waitForTransaction)
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
          assertOk(result);
          expect(result.value.length).toBe(0);
        }, 25_000);
      });
    });
  });
});
