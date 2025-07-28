import { OrderDirection } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  fundErc20Address,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import { borrow, supply } from './transactions';
import { userTransactionHistory } from './user';

const user = createNewWallet();

function assertDatesInOrder<T extends { timestamp: string }>(
  items: T[],
  direction: 'asc' | 'desc' = 'desc',
): void {
  for (let i = 0; i < items.length - 1; i++) {
    const currentItem = items[i];
    const nextItem = items[i + 1];
    const currentTimestamp = new Date(currentItem!.timestamp).getTime();
    const nextTimestamp = new Date(nextItem!.timestamp).getTime();

    if (direction === 'desc') {
      expect(currentTimestamp).toBeGreaterThanOrEqual(nextTimestamp);
    } else {
      expect(currentTimestamp).toBeLessThanOrEqual(nextTimestamp);
    }
  }
}

describe('Given an Aave Market', () => {
  describe('And a user with prior history of transactions', () => {
    describe('When fetching the user transaction history', () => {
      beforeAll(async () => {
        await fundErc20Address(
          WETH_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal('1.1'),
        );

        const resultSupply = await supply(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          supplier: evmAddress(user.account!.address),
          amount: {
            erc20: {
              value: '1',
              currency: WETH_ADDRESS,
            },
          },
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(user))
          .andThen(client.waitForTransaction);
        assertOk(resultSupply);

        const resultBorrow = await borrow(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          borrower: evmAddress(user.account!.address),
          amount: {
            erc20: { value: '0.04', currency: WETH_ADDRESS },
          },
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(user))
          .andThen(client.waitForTransaction);
        assertOk(resultBorrow);
      }, 60_000);

      it('Then it should be possible so sort them by date', async () => {
        const listTxOrderDesc = await userTransactionHistory(client, {
          user: evmAddress(user.account!.address),
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          orderBy: { date: OrderDirection.Desc },
        });

        assertOk(listTxOrderDesc);
        expect(listTxOrderDesc.value.items.length).toBeGreaterThan(0);
        assertDatesInOrder(listTxOrderDesc.value.items, 'desc');

        const listTxOrderAsc = await userTransactionHistory(client, {
          user: evmAddress(user.account!.address),
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          orderBy: { date: OrderDirection.Asc },
        });

        assertOk(listTxOrderAsc);
        expect(listTxOrderAsc.value.items.length).toBeGreaterThan(0);
        assertDatesInOrder(listTxOrderAsc.value.items, 'asc');
      });
    });
  });
});
