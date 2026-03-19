import type { TokenAmount } from '@aave/client';
import { savingsGhoBalance } from '@aave/client/actions';

import * as common from '../../common.js';

export default class GhoBalance extends common.V3Command {
  static override description = 'View sGHO (savings GHO) balance for a user';

  static override flags = {
    user: common.user({
      required: true,
      description: 'User wallet address',
    }),
  };

  protected override headers = [
    { value: 'Token' },
    { value: 'Balance' },
    { value: 'USD Value' },
  ];

  async run(): Promise<TokenAmount> {
    const { flags } = await this.parse(GhoBalance);

    const result = await savingsGhoBalance(this.client, {
      user: flags.user,
    });

    if (result.isErr()) {
      this.error(result.error);
    }

    this.display([['sGHO', result.value.amount.value, `$${result.value.usd}`]]);

    return result.value;
  }
}
