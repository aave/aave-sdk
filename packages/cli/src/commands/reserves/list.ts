import type { Market } from '@aave/client';
import { market } from '@aave/client/actions';

import * as common from '../../common.js';

export default class ListReserves extends common.V3Command {
  static override description = 'List reserves for an Aave v3 market';

  static override flags = {
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
    { value: 'Supply APY' },
    { value: 'Borrow APY' },
    { value: 'Available Liquidity' },
    { value: 'Total Borrowed' },
    { value: 'Collateral' },
  ];

  async run(): Promise<Market | null> {
    const { flags } = await this.parse(ListReserves);

    const result = await market(this.client, {
      address: flags.market,
      chainId: flags.chain,
    });

    if (result.isErr()) {
      this.error(result.error);
    }

    if (!result.value) {
      this.log('Market not found');
      return null;
    }

    const mkt = result.value;

    this.display(
      mkt.supplyReserves.map((reserve) => {
        const borrowReserve = mkt.borrowReserves.find(
          (b) => b.underlyingToken.address === reserve.underlyingToken.address,
        );

        const borrowInfo = borrowReserve?.borrowInfo;

        return [
          reserve.underlyingToken.name,
          reserve.underlyingToken.symbol,
          reserve.supplyInfo.apy.formatted,
          borrowInfo?.apy.formatted ?? 'N/A',
          borrowInfo?.availableLiquidity
            ? `$${borrowInfo.availableLiquidity.usd}`
            : 'N/A',
          borrowInfo?.total ? `$${borrowInfo.total.usd}` : 'N/A',
          reserve.supplyInfo.canBeCollateral ? 'Yes' : 'No',
        ];
      }),
    );

    return mkt;
  }
}
