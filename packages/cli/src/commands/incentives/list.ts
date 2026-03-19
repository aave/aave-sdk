import { userMeritRewards } from '@aave/client/actions';

import * as common from '../../common.js';

export default class ListIncentives extends common.V3Command {
  static override description = 'View user Merit reward incentives';

  static override flags = {
    user: common.user({
      required: true,
      description: 'User wallet address',
    }),
    chain: common.chain({
      required: true,
      description: 'The chain ID to check rewards on',
    }),
  };

  protected override headers = [
    { value: 'Token' },
    { value: 'Claimable Amount' },
    { value: 'USD Value' },
  ];

  async run(): Promise<unknown> {
    const { flags } = await this.parse(ListIncentives);

    const result = await userMeritRewards(this.client, {
      user: flags.user,
      chainId: flags.chain,
    });

    if (result.isErr()) {
      this.error(result.error);
    }

    const rewards = result.value;

    if (!rewards || !rewards.claimable || rewards.claimable.length === 0) {
      this.log('No claimable rewards found for this user');
      return rewards;
    }

    this.display(
      rewards.claimable.map((reward) => [
        reward.currency.symbol,
        reward.amount.amount.value,
        `$${reward.amount.usd}`,
      ]),
    );

    return rewards;
  }
}
