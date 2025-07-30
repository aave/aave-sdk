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
      const user = createNewWallet();

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.02'),
        ).andThen(() =>
          supplyAndBorrow(user, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(user.account!.address),
            amount: {
              erc20: { currency: ETHEREUM_WETH_ADDRESS, value: '0.01' },
            },
          }),
        );
        assertOk(setup);
      });

      it('Then it should be reflected in the user borrow positions', async () => {
        const result = await repay(client, {
          amount: { erc20: { currency: ETHEREUM_WETH_ADDRESS, value: '0.01' } },
          borrower: evmAddress(user.account!.address),
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
        })
          .andThen(sendWith(user))
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
        const user = createNewWallet();

        beforeAll(async () => {
          const setup = await fundNativeAddress(
            evmAddress(user.account!.address),
            bigDecimal('0.02'),
          )
            .andThen(() =>
              fundErc20Address(
                ETHEREUM_WETH_ADDRESS,
                evmAddress(user.account!.address),
                bigDecimal('0.02'),
              ),
            )
            .andThen(() =>
              supplyAndBorrow(user, {
                market: ETHEREUM_MARKET_ADDRESS,
                chainId: ETHEREUM_FORK_ID,
                supplier: evmAddress(user.account!.address),
                amount: {
                  erc20: { currency: ETHEREUM_WETH_ADDRESS, value: '0.01' },
                },
              }),
            );
          assertOk(setup);
        });

        it('Then it should be reflected in the user borrow positions', async () => {
          const result = await repay(client, {
            amount: { native: '0.01' },
            borrower: evmAddress(user.account!.address),
            chainId: ETHEREUM_FORK_ID,
            market: ETHEREUM_MARKET_ADDRESS,
          })
            .andThen(sendWith(user))
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
    });
  });

  describe('And an open borrow position', () => {
    describe(`When a user repays the owner's loan via a permit signature`, () => {
      const user = createNewWallet();
      const owner = createNewWallet();

      beforeAll(async () => {
        const setup = await Promise.all([
          fundErc20Address(
            ETHEREUM_USDC_ADDRESS,
            evmAddress(owner.account!.address),
            bigDecimal('105'),
            6,
          ),
          fundErc20Address(
            ETHEREUM_USDC_ADDRESS,
            evmAddress(user.account!.address),
            bigDecimal('200'),
            6,
          ),
        ]).then(([userFundResult, delegateFundResult]) => {
          assertOk(userFundResult);
          assertOk(delegateFundResult);
          return supplyAndBorrow(owner, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            supplier: evmAddress(owner.account!.address),
            amount: {
              erc20: { currency: ETHEREUM_USDC_ADDRESS, value: '100' },
            },
          });
        });
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
          amount: reserve.borrowInfo?.total.amount.value,
          chainId: reserve.market.chain.chainId,
          spender: evmAddress(user.account!.address),
          owner: evmAddress(owner.account!.address),
        }).andThen(signERC20PermitWith(user));
        assertOk(signature);

        const result = await repay(client, {
          amount: {
            erc20: {
              currency: ETHEREUM_USDC_ADDRESS,
              value: '100',
              erc712: signature.value,
            },
          },
          borrower: evmAddress(user.account!.address),
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
        })
          .andThen(sendWith(user))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userBorrows(client, {
              markets: [
                {
                  address: ETHEREUM_MARKET_ADDRESS,
                  chainId: ETHEREUM_FORK_ID,
                },
              ],
              user: evmAddress(owner.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value.length).toBe(0);
      }, 50_000);
    });
  });
});
