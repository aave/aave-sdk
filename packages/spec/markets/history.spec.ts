import { assertOk, chainId, evmAddress, OrderDirection } from '@aave/client';
import { userTransactionHistory } from '@aave/client/actions';
import { client, ETHEREUM_MARKET_ADDRESS } from '@aave/client/test-utils';
import { describe, expect, it } from 'vitest';

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

// NOTE: hardcoded wallet from mainnet to get results, because no results generated in staging
const user = '0xC91B41caBfecA199c6E2B84a9DA08d24f3853397';

describe('Given an Aave Market', () => {
  describe('And a user with prior history of transactions', () => {
    describe('When fetching the user transaction history', () => {
      it('Then it should be possible so sort them by date', async () => {
        const listTxOrderDesc = await userTransactionHistory(client, {
          user: evmAddress(user),
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: chainId(1),
          orderBy: { date: OrderDirection.Desc },
        });

        assertOk(listTxOrderDesc);
        expect(listTxOrderDesc.value.items.length).toBeGreaterThan(0);
        assertDatesInOrder(listTxOrderDesc.value.items, 'desc');

        const listTxOrderAsc = await userTransactionHistory(client, {
          user: evmAddress(user),
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: chainId(1),
          orderBy: { date: OrderDirection.Asc },
        });

        assertOk(listTxOrderAsc);
        expect(listTxOrderAsc.value.items.length).toBeGreaterThan(0);
        assertDatesInOrder(listTxOrderAsc.value.items, 'asc');
      });
    });
  });
});
