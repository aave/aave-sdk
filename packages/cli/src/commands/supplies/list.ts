import type { MarketUserReserveSupplyPosition } from '@aave/client';
import { userSupplies } from '@aave/client/actions';

import * as common from '../../common.js';

export default class ListSupplies extends common.V3Command {
  static override description = 'List user supply positions';

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
    { value: 'Balance' },
    { value: 'Balance (USD)' },
    { value: 'Supply APY' },
    { value: 'Collateral' },
  ];

  async run(): Promise<MarketUserReserveSupplyPosition[]> {
    const { flags } = await this.parse(ListSupplies);

    const result = await userSupplies(this.client, {
      markets: [{ address: flags.market, chainId: flags.chain }],
      user: flags.user,
    });

    if (result.isErr()) {
      this.error(result.error);
    }

    if (result.value.length === 0) {
      this.log('No supply positions found for this user');
      return result.value;
    }

    this.display(
      result.value.map((item) => [
        item.currency.name,
        item.currency.symbol,
        item.balance.amount.value,
        `$${item.balance.usd}`,
        item.apy.formatted,
        item.isCollateral ? 'Yes' : 'No',
      ]),
    );

    return result.value;
  }
}
