import type { SupplyRequest } from '@aave/graphql';
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
  fundErc20Address,
  fundNativeAddress,
} from '../test-utils';
import { sendWith } from '../viem';
import { reserve } from './reserve';
import { borrow, repay, supply } from './transactions';
import { userBorrows } from './user';

function supplyAndBorrow(
  wallet: WalletClient,
  request: SupplyRequest,
): ResultAsync<string, Error> {
  const userAddress = evmAddress(wallet.account!.address);
  return supply(client, request)
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
}

describe('Given an Aave Market', () => {
  describe('And a user with a borrow position', () => {
    describe('When the user repays their loan', () => {
      const userRepayErc20 = createNewWallet();

      it('Then it should be reflected in the user borrow positions', async () => {
        const setup = await fundErc20Address(
          WETH_ADDRESS,
          evmAddress(userRepayErc20.account!.address),
          bigDecimal('0.02'),
        ).andThen(() =>
          supplyAndBorrow(userRepayErc20, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(userRepayErc20.account!.address),
            amount: { erc20: { currency: WETH_ADDRESS, value: '0.01' } },
          }),
        );
        assertOk(setup);

        const result = await repay(client, {
          amount: { erc20: { currency: WETH_ADDRESS, value: '0.01' } },
          borrower: evmAddress(userRepayErc20.account!.address),
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
        })
          .andThen(sendWith(userRepayErc20))
          .andTee((tx) => console.log(`Repaid tx: ${tx}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userBorrows(client, {
              markets: [
                {
                  address: ETHEREUM_MARKET_ADDRESS,
                  chainId: ETHEREUM_FORK_ID,
                },
              ],
              user: evmAddress(userRepayErc20.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value.length).toBe(0);
      }, 50_000);
    });

    describe('And the reserve allows repaying in native tokens', () => {
      describe('When the user repays their loan in native tokens', () => {
        const userRepayNative = createNewWallet();

        it('Then it should be reflected in the user borrow positions', async () => {
          const setup = await fundNativeAddress(
            evmAddress(userRepayNative.account!.address),
            bigDecimal('0.02'),
          )
            .andThen(() =>
              fundErc20Address(
                WETH_ADDRESS,
                evmAddress(userRepayNative.account!.address),
                bigDecimal('0.02'),
              ),
            )
            .andThen(() =>
              supplyAndBorrow(userRepayNative, {
                market: ETHEREUM_MARKET_ADDRESS,
                chainId: ETHEREUM_FORK_ID,
                supplier: evmAddress(userRepayNative.account!.address),
                amount: { erc20: { currency: WETH_ADDRESS, value: '0.01' } },
              }),
            );
          assertOk(setup);

          const result = await repay(client, {
            amount: { native: '0.01' },
            borrower: evmAddress(userRepayNative.account!.address),
            chainId: ETHEREUM_FORK_ID,
            market: ETHEREUM_MARKET_ADDRESS,
          })
            .andThen(sendWith(userRepayNative))
            .andTee((tx) => console.log(`Repaid tx: ${tx}`))
            .andThen(client.waitForTransaction)
            .andThen(() =>
              userBorrows(client, {
                markets: [
                  {
                    address: ETHEREUM_MARKET_ADDRESS,
                    chainId: ETHEREUM_FORK_ID,
                  },
                ],
                user: evmAddress(userRepayNative.account!.address),
              }),
            );
          assertOk(result);
          expect(result.value.length).toBe(0);
        }, 50_000);
      });
    });
  });
});
