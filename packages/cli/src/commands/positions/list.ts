import type { MarketUserState } from '@aave/client';
import { userMarketState } from '@aave/client/actions';

import * as common from '../../common.js';

export default class ListPositions extends common.V3Command {
  static override description = 'View user position summary for a market';

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
    { value: 'Net Worth' },
    { value: 'Total Collateral' },
    { value: 'Total Debt' },
    { value: 'Health Factor' },
    { value: 'Available to Borrow' },
    { value: 'LTV' },
    { value: 'In Isolation' },
  ];

  async run(): Promise<MarketUserState> {
    const { flags } = await this.parse(ListPositions);

    const result = await userMarketState(this.client, {
      market: flags.market,
      user: flags.user,
      chainId: flags.chain,
    });

    if (result.isErr()) {
      this.error(result.error);
    }

    const state = result.value;

    this.display([
      [
        `$${state.netWorth}`,
        `$${state.totalCollateralBase}`,
        `$${state.totalDebtBase}`,
        state.healthFactor ?? 'N/A (no borrows)',
        `$${state.availableBorrowsBase}`,
        state.ltv.formatted,
        state.isInIsolationMode ? 'Yes' : 'No',
      ],
    ]);

    return state;
  }
}
