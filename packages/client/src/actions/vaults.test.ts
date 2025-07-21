import { assertOk, evmAddress } from '@aave/types';
import { describe, expect, it } from 'vitest';
import { client, wallet } from '../test-utils';
import { vaults } from './vaults';

describe('Given the Aave Protocol v3', () => {
  describe('When fetching vaults data', () => {
    it('Then it should be possible to fetch vaults owned by a given user', async () => {
      const result = await vaults(client, {
        criteria: {
          ownedBy: [evmAddress(wallet.account!.address)],
        },
      });

      assertOk(result);

      result.value.items.forEach((vault) => {
        expect(vault).toMatchSnapshot();
      });
    });
  });
});
