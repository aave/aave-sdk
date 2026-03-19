import type { MarketUserReserveBorrowPosition } from '@aave/client';
import { userBorrows } from '@aave/client/actions';

import * as common from '../../common.js';

export default class ListBorrows extends common.V3Command {
  static override description = 'List user borrow positions';

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
    { value: 'Asset' },
    { value: 'Symbol' },
    { value: 'Debt' },
    { value: 'Debt (USD)' },
    { value: 'Borrow APY' },
  ];

  async run(): Promise<MarketUserReserveBorrowPosition[]> {
    const { flags } = await this.parse(ListBorrows);

    const result = await userBorrows(this.client, {
      markets: [{ address: flags.market, chainId: flags.chain }],
      user: flags.user,
    });

    if (result.isErr()) {
      this.error(result.error);
    }

    if (result.value.length === 0) {
      this.log('No borrow positions found for this user');
      return result.value;
    }

    this.display(
      result.value.map((item) => [
        item.currency.name,
        item.currency.symbol,
        item.debt.amount.value,
        `$${item.debt.usd}`,
        item.apy.formatted,
      ]),
    );

    return result.value;
  }
}
