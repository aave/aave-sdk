import {
  bigDecimal,
  type HealthFactorPreviewRequest,
  type HealthFactorPreviewResponse,
} from '@aave/client';
import { healthFactorPreview } from '@aave/client/actions';
import { Flags } from '@oclif/core';

import * as common from '../../common.js';

export default class HealthFactorPreviewCommand extends common.V3Command {
  static override description =
    'Preview health factor impact of a supply or borrow action';

  static override flags = {
    action: Flags.string({
      required: true,
      options: ['supply', 'borrow', 'repay', 'withdraw'],
      description: 'The action type to simulate',
    }),
    market: common.market({
      required: true,
      description: 'The market pool address',
    }),
    chain: common.chain({
      required: true,
      description: 'The chain ID the market is on',
    }),
    user: common.user({
      required: true,
      description: 'The user performing the action',
    }),
    token: common.address({
      name: 'token',
      required: true,
      description: 'The underlying token address',
    }),
    amount: Flags.string({
      required: true,
      description: 'The amount to simulate',
    }),
  };

  protected override headers = [
    { value: 'Health Factor Before' },
    { value: 'Health Factor After' },
    { value: 'Change' },
  ];

  async run(): Promise<HealthFactorPreviewResponse> {
    const { flags } = await this.parse(HealthFactorPreviewCommand);

    const baseRequest = {
      market: flags.market,
      chainId: flags.chain,
      sender: flags.user,
    };

    const value = bigDecimal(flags.amount);

    let action: HealthFactorPreviewRequest['action'];
    switch (flags.action) {
      case 'supply':
        action = {
          supply: {
            ...baseRequest,
            amount: { erc20: { currency: flags.token, value } },
          },
        };
        break;
      case 'borrow':
        action = {
          borrow: {
            ...baseRequest,
            amount: { erc20: { currency: flags.token, value } },
          },
        };
        break;
      case 'repay':
        action = {
          repay: {
            ...baseRequest,
            amount: {
              erc20: { currency: flags.token, value: { exact: value } },
            },
          },
        };
        break;
      case 'withdraw':
        action = {
          withdraw: {
            ...baseRequest,
            amount: {
              erc20: { currency: flags.token, value: { exact: value } },
            },
          },
        };
        break;
      default:
        this.error(`Unknown action: ${flags.action}`);
    }

    const result = await healthFactorPreview(this.client, { action });

    if (result.isErr()) {
      this.error(result.error);
    }

    const before = result.value.before;
    const after = result.value.after;

    this.display([
      [
        before != null ? Number(before).toFixed(2) : 'N/A (no borrows)',
        after != null ? Number(after).toFixed(2) : 'N/A',
        before != null && after != null
          ? `${(Number(after) - Number(before)).toFixed(2)}`
          : '-',
      ],
    ]);

    return result.value;
  }
}
