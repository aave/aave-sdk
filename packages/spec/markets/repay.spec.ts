import {
  type AmountInput,
  assertOk,
  bigDecimal,
  evmAddress,
  nonNullable,
  ResultAsync,
} from '@aave/client';
import {
  borrow,
  permitTypedData,
  repay,
  reserve,
  supply,
  userBorrows,
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
import { sendWith, signERC20PermitWith } from '@aave/client/viem';
import type { WalletClient } from 'viem';
import { beforeAll, describe, expect, it } from 'vitest';

function supplyAndBorrow(
  wallet: WalletClient,
  amount: AmountInput,
): ResultAsync<string, Error> {
  const userAddress = evmAddress(wallet.account!.address);
  return supply(client, {
    market: ETHEREUM_MARKET_ADDRESS,
    chainId: ETHEREUM_FORK_ID,
    sender: evmAddress(wallet.account!.address),
    amount,
  })
    .andThen(sendWith(wallet))
    .andThen(client.waitForTransaction)
    .andThen(() =>
      reserve(client, {
        market: ETHEREUM_MARKET_ADDRESS,
        user: userAddress,
        chainId: ETHEREUM_FORK_ID,
        underlyingToken:
          'erc20' in amount ? amount.erc20.currency : ETHEREUM_WETH_ADDRESS,
      }),
    )
    .map(nonNullable)
    .andThen((reserve) =>
      borrow(client, {
        market: reserve.market.address,
        amount: {
          erc20: {
            currency: reserve.underlyingToken.address,
            value: reserve.userState!.borrowable.amount.value,
          },
        },
        sender: userAddress,
        chainId: ETHEREUM_FORK_ID,
      }),
    )
    .andThen(sendWith(wallet))
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
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: bigDecimal('0.01'),
            },
          }),
        );
        assertOk(setup);
      }, 50_000);

      it('Then it should be reflected in the user borrow positions', async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(user.account!.address)}`);

        const result = await repay(client, {
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: { max: true },
            },
          },
          sender: evmAddress(user.account!.address),
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx repay full amount: ${tx.txHash}`))
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

    describe('When the user repays a partial amount of their loan', () => {
      const user = createNewWallet();

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('0.02'),
        ).andThen(() =>
          supplyAndBorrow(user, {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: bigDecimal('0.01'),
            },
          }),
        );
        assertOk(setup);
      });

      it('Then it should be reflected in the user borrow positions', async ({
        annotate,
      }) => {
        annotate(`user address: ${evmAddress(user.account!.address)}`);

        const userBorrowsBefore = await userBorrows(client, {
          markets: [
            {
              address: ETHEREUM_MARKET_ADDRESS,
              chainId: ETHEREUM_FORK_ID,
            },
          ],
          user: evmAddress(user.account!.address),
        });
        assertOk(userBorrowsBefore);

        // Pay half of the loan
        const result = await repay(client, {
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: {
                exact: bigDecimal(
                  Number(userBorrowsBefore.value[0]?.debt.amount.value) * 0.5,
                ),
              },
            },
          },
          sender: evmAddress(user.account!.address),
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx repay partial amount: ${tx.txHash}`))
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
        expect(result.value.length).toBe(1);
        expect(result.value[0]?.debt.amount.value).toBeBigDecimalCloseTo(
          Number(userBorrowsBefore.value[0]?.debt.amount.value) * 0.5,
          4,
        );
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
                erc20: {
                  currency: ETHEREUM_WETH_ADDRESS,
                  value: bigDecimal('0.01'),
                },
              }),
            );
          assertOk(setup);
        });

        it('Then it should be reflected in the user borrow positions', async ({
          annotate,
        }) => {
          annotate(`user address: ${evmAddress(user.account!.address)}`);

          const result = await repay(client, {
            amount: { native: bigDecimal('0.01') },
            sender: evmAddress(user.account!.address),
            chainId: ETHEREUM_FORK_ID,
            market: ETHEREUM_MARKET_ADDRESS,
          })
            .andThen(sendWith(user))
            .andTee((tx) => annotate(`tx repay native amount: ${tx.txHash}`))
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
    describe('When a user repays a full loan amount in behalf of another address', () => {
      const user = createNewWallet();
      const anotherUser = createNewWallet();

      beforeAll(async () => {
        const setup = await ResultAsync.combine([
          fundErc20Address(
            ETHEREUM_USDC_ADDRESS,
            evmAddress(anotherUser.account!.address),
            bigDecimal('105'),
            6,
          ),
          fundErc20Address(
            ETHEREUM_USDC_ADDRESS,
            evmAddress(user.account!.address),
            bigDecimal('200'),
            6,
          ),
        ]).andThen(() =>
          supplyAndBorrow(anotherUser, {
            erc20: {
              currency: ETHEREUM_USDC_ADDRESS,
              value: bigDecimal('100'),
            },
          }),
        );
        assertOk(setup);
      });

      it('Then it should be reflected in the borrow positions of the other address', async ({
        annotate,
      }) => {
        annotate(`owner address: ${evmAddress(anotherUser.account!.address)}`);
        annotate(`user address: ${evmAddress(user.account!.address)}`);

        const reserve = await fetchReserve(
          ETHEREUM_USDC_ADDRESS,
          evmAddress(anotherUser.account!.address),
        );
        expect(reserve.permitSupported).toBe(true);

        const result = await repay(client, {
          onBehalfOf: evmAddress(anotherUser.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_USDC_ADDRESS,
              value: { exact: bigDecimal('100') }, // Not possible to repay with max value when onBehalfOf is provided
            },
          },
          sender: evmAddress(user.account!.address),
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx repay on behalf of: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userBorrows(client, {
              markets: [
                {
                  address: ETHEREUM_MARKET_ADDRESS,
                  chainId: ETHEREUM_FORK_ID,
                },
              ],
              user: evmAddress(anotherUser.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value.length).toBe(0);
      }, 50_000);
    });

    describe('When a user repays a loan with a permit signature', () => {
      const user = createNewWallet();

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_USDC_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('300'),
          6,
        ).andThen(() =>
          supplyAndBorrow(user, {
            erc20: {
              currency: ETHEREUM_USDC_ADDRESS,
              value: bigDecimal('100'),
            },
          }),
        );
        assertOk(setup);
      });

      it('Then it should allow to repay their own loan without needing for an ERC20 Approval transaction', async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);

        const signature = await permitTypedData(client, {
          currency: ETHEREUM_USDC_ADDRESS,
          amount: bigDecimal('100'),
          chainId: ETHEREUM_FORK_ID,
          spender: ETHEREUM_MARKET_ADDRESS,
          owner: evmAddress(user.account!.address),
        }).andThen(signERC20PermitWith(user));
        assertOk(signature);

        const result = await repay(client, {
          amount: {
            erc20: {
              currency: ETHEREUM_USDC_ADDRESS,
              value: { max: true },
              permitSig: signature.value,
            },
          },
          sender: evmAddress(user.account!.address),
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
        })
          .andTee((tx) => annotate(`tx plan: ${JSON.stringify(tx, null, 2)}`))
          .andTee((tx) => expect(tx.__typename).toEqual('TransactionRequest'))
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx repay with permit: ${tx.txHash}`))
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

    describe('When a user repays a loan in behalf of another address with a permit signature', () => {
      const user = createNewWallet();
      const anotherUser = createNewWallet();

      beforeAll(async () => {
        const setup = await ResultAsync.combine([
          fundErc20Address(
            ETHEREUM_USDC_ADDRESS,
            evmAddress(anotherUser.account!.address),
            bigDecimal('105'),
            6,
          ),
          fundErc20Address(
            ETHEREUM_USDC_ADDRESS,
            evmAddress(user.account!.address),
            bigDecimal('200'),
            6,
          ),
        ]).andThen(() =>
          supplyAndBorrow(anotherUser, {
            erc20: {
              currency: ETHEREUM_USDC_ADDRESS,
              value: bigDecimal('100'),
            },
          }),
        );
        assertOk(setup);
      });

      it(`Then it should be reflected in the other user's borrow positions`, async ({
        annotate,
      }) => {
        annotate(`other address: ${evmAddress(anotherUser.account!.address)}`);
        annotate(`user address: ${evmAddress(user.account!.address)}`);

        const reserve = await fetchReserve(
          ETHEREUM_USDC_ADDRESS,
          evmAddress(anotherUser.account!.address),
        );

        const result = await permitTypedData(client, {
          currency: reserve.underlyingToken.address,
          amount: bigDecimal('100'),
          chainId: reserve.market.chain.chainId,
          spender: reserve.market.address,
          owner: evmAddress(user.account!.address),
        })
          .andThen(signERC20PermitWith(user))
          .andThen((signature) =>
            repay(client, {
              onBehalfOf: evmAddress(anotherUser.account!.address),
              amount: {
                erc20: {
                  currency: ETHEREUM_USDC_ADDRESS,
                  value: { exact: bigDecimal('100') }, // Not possible to repay with max value when onBehalfOf is provided
                  permitSig: signature,
                },
              },
              sender: evmAddress(user.account!.address),
              chainId: ETHEREUM_FORK_ID,
              market: ETHEREUM_MARKET_ADDRESS,
            })
              .andThen(sendWith(user))
              .andTee((tx) =>
                annotate(`tx repay on behalf of with permit: ${tx.txHash}`),
              )
              .andThen(client.waitForTransaction)
              .andThen(() =>
                userBorrows(client, {
                  markets: [
                    {
                      address: ETHEREUM_MARKET_ADDRESS,
                      chainId: ETHEREUM_FORK_ID,
                    },
                  ],
                  user: evmAddress(anotherUser.account!.address),
                }),
              ),
          );
        assertOk(result);
        expect(result.value.length).toBe(0);
      }, 50_000);
    });
  });
});
