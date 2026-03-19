import type {
  PaginatedVaultsResult,
  ResultAsync,
  UnexpectedError,
} from '@aave/client';
import { userVaults, vaults } from '@aave/client/actions';

import * as common from '../../common.js';

export default class ListVaults extends common.V3Command {
  static override description = 'List Aave v3 vaults';

  static override flags = {
    user: common.user({
      required: false,
      description:
        'Filter vaults by user (shows vaults the user has shares in)',
    }),
    owner: common.address({
      name: 'owner',
      required: false,
      description: 'Filter vaults by owner address',
    }),
  };

  protected override headers = [
    { value: 'Address' },
    { value: 'Share Name' },
    { value: 'Symbol' },
    { value: 'Reserve' },
    { value: 'Chain' },
    { value: 'APR' },
    { value: 'TVL (USD)' },
    { value: 'Fee' },
  ];

  async run(): Promise<PaginatedVaultsResult> {
    const { flags } = await this.parse(ListVaults);

    let pending: ResultAsync<PaginatedVaultsResult, UnexpectedError>;

    if (flags.user) {
      pending = userVaults(this.client, {
        user: flags.user,
      });
    } else {
      pending = vaults(this.client, {
        criteria: flags.owner ? { ownedBy: [flags.owner] } : { ownedBy: [] },
        user: flags.user,
      });
    }

    const result = await pending;

    if (result.isErr()) {
      this.error(result.error);
    }

    if (result.value.items.length === 0) {
      this.log('No vaults found');
      return result.value;
    }

    this.display(
      result.value.items.map((item) => [
        item.address,
        item.shareName,
        item.shareSymbol,
        item.usedReserve.underlyingToken.name,
        item.chainId,
        item.vaultApr.formatted,
        `$${item.balance.usd}`,
        item.fee.formatted,
      ]),
    );

    return result.value;
  }
}
