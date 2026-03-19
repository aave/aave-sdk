import {
  type Chain,
  type ChainId,
  ChainsFilter,
  type Market,
} from '@aave/client';
import { chains, markets } from '@aave/client/actions';

import * as common from '../../common.js';

export default class ListMarkets extends common.V3Command {
  static override description = 'List Aave v3 markets';

  static override flags = {
    chain: common.chain({
      required: false,
      description: 'Filter by chain ID',
    }),
  };

  protected override headers = [
    { value: 'Market' },
    { value: 'Pool Address' },
    { value: 'Chain' },
    { value: 'Reserves' },
  ];

  async run(): Promise<Market[]> {
    const { flags } = await this.parse(ListMarkets);

    let chainIds: ChainId[];

    if (flags.chain) {
      chainIds = [flags.chain];
    } else {
      const chainsResult = await chains(this.client, ChainsFilter.ALL);
      if (chainsResult.isErr()) {
        this.error(chainsResult.error);
      }
      chainIds = chainsResult.value.map((c: Chain) => c.chainId);
    }

    const result = await markets(this.client, { chainIds });

    if (result.isErr()) {
      this.error(result.error);
    }

    this.display(
      result.value.map((item) => [
        item.name,
        item.address,
        `${item.chain.name} (${item.chain.chainId})`,
        item.supplyReserves.length,
      ]),
    );

    return result.value;
  }
}
