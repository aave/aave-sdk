import type { SupplyRequest } from '@aave/graphql';
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
      const userErc20 = createNewWallet();

      it('Then it should be reflected in the user borrow positions', async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(userErc20.account!.address),
          bigDecimal('0.02'),
        ).andThen(() =>
          supplyAndBorrow(userErc20, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(userErc20.account!.address),
            amount: {
              erc20: { currency: ETHEREUM_WETH_ADDRESS, value: '0.01' },
            },
          }),
        );
        assertOk(setup);

        const result = await repay(client, {
          amount: { erc20: { currency: ETHEREUM_WETH_ADDRESS, value: '0.01' } },
          borrower: evmAddress(userErc20.account!.address),
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
        })
          .andThen(sendWith(userErc20))
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
              user: evmAddress(userErc20.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value.length).toBe(0);
      }, 50_000);
    });

    describe('When a delegate user repays their loan via a permit signature', () => {
      const delegateUser = createNewWallet();
      const user = createNewWallet();

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_USDC_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('105'),
          6,
        ).andThen(() =>
          supplyAndBorrow(user, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(user.account!.address),
            amount: {
              erc20: { currency: ETHEREUM_USDC_ADDRESS, value: '100' },
            },
          }).andThen(() =>
            fundErc20Address(
              ETHEREUM_USDC_ADDRESS,
              evmAddress(delegateUser.account!.address),
              bigDecimal('200'),
              6,
            ),
          ),
        );
        assertOk(setup);
      });

      it('Then it should be reflected in the user borrow positions', async () => {
        const reserve = await fetchReserve(
          ETHEREUM_USDC_ADDRESS,
          evmAddress(user.account!.address),
        );
        expect(reserve.permitSupported).toBe(true);

        const signature = await permitTypedData(client, {
          market: reserve.market.address,
          underlyingToken: reserve.underlyingToken.address,
          amount: reserve.borrowInfo?.total.amount.value,
          chainId: reserve.market.chain.chainId,
          spender: evmAddress(delegateUser.account!.address),
          owner: evmAddress(user.account!.address),
        }).andThen(signERC20PermitWith(delegateUser));
        assertOk(signature);

        const result = await repay(client, {
          amount: {
            erc20: {
              currency: ETHEREUM_USDC_ADDRESS,
              value: '100',
              erc712: signature.value,
            },
          },
          borrower: evmAddress(delegateUser.account!.address),
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
        })
          .andThen(sendWith(delegateUser))
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
        expect(result.value.length).toBe(0);
      }, 50_000);
    });

    describe('And the reserve allows repaying in native tokens', () => {
      describe('When the user repays their loan in native tokens', () => {
        const userNative = createNewWallet();

        it('Then it should be reflected in the user borrow positions', async () => {
          const setup = await fundNativeAddress(
            evmAddress(userNative.account!.address),
            bigDecimal('0.02'),
          )
            .andThen(() =>
              fundErc20Address(
                ETHEREUM_WETH_ADDRESS,
                evmAddress(userNative.account!.address),
                bigDecimal('0.02'),
              ),
            )
            .andThen(() =>
              supplyAndBorrow(userNative, {
                market: ETHEREUM_MARKET_ADDRESS,
                chainId: ETHEREUM_FORK_ID,
                supplier: evmAddress(userNative.account!.address),
                amount: {
                  erc20: { currency: ETHEREUM_WETH_ADDRESS, value: '0.01' },
                },
              }),
            );
          assertOk(setup);

          const result = await repay(client, {
            amount: { native: '0.01' },
            borrower: evmAddress(userNative.account!.address),
            chainId: ETHEREUM_FORK_ID,
            market: ETHEREUM_MARKET_ADDRESS,
          })
            .andThen(sendWith(userNative))
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
                user: evmAddress(userNative.account!.address),
              }),
            );
          assertOk(result);
          expect(result.value.length).toBe(0);
        }, 50_000);
      });
    });
  });
});
