import type { PaginatedUserTransactionHistoryResult } from '@aave/client';
import { userTransactionHistory } from '@aave/client/actions';

import * as common from '../../common.js';

export default class ListHistory extends common.V3Command {
  static override description = 'View user transaction history for a market';

  static override flags = {
    user: common.user({
      required: true,
      description: 'User wallet address',
    }),
    market: common.market({
      required: true,
      description: 'The market pool address',
    }),
    chain: common.chain({
      required: true,
      description: 'The chain ID the market is on',
    }),
  };

  protected override headers = [
    { value: 'Type' },
    { value: 'Asset' },
    { value: 'Amount' },
    { value: 'USD' },
    { value: 'Date' },
    { value: 'Tx Hash' },
  ];

  async run(): Promise<PaginatedUserTransactionHistoryResult> {
    const { flags } = await this.parse(ListHistory);

    const result = await userTransactionHistory(this.client, {
      market: flags.market,
      user: flags.user,
      chainId: flags.chain,
    });

    if (result.isErr()) {
      this.error(result.error);
    }

    if (result.value.items.length === 0) {
      this.log('No transaction history found for this user');
      return result.value;
    }

    this.display(
      result.value.items.map((item) => {
        const type = item.__typename
          .replace('User', '')
          .replace('Transaction', '');
        const reserve =
          'reserve' in item && item.reserve
            ? item.reserve.underlyingToken.name
            : '-';

        if ('amount' in item && item.amount) {
          return [
            type,
            reserve,
            item.amount.amount.value,
            `$${item.amount.usd}`,
            new Date(item.timestamp).toLocaleString(),
            item.txHash,
          ];
        }

        return [
          type,
          reserve,
          '-',
          '-',
          new Date(item.timestamp).toLocaleString(),
          item.txHash,
        ];
      }),
    );

    return result.value;
  }
}
