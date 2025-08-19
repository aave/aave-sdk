import { assertOk, evmAddress } from '@aave/client';
import { client, createNewWallet } from '@aave/client/test-utils';
import { chainId } from '@aave/types';
import { describe, expect, it } from 'vitest';
import { meritClaimRewards } from './incentives';

describe('Given a chain supporting Merit rewards', () => {
  const wallet = createNewWallet();

  describe('When a user does not have any Merit rewards', () => {
    it('Then they should not see any Merit rewards to claim', async () => {
      const result = await meritClaimRewards(client, {
        user: evmAddress(wallet.account!.address),
        chainId: chainId(1),
      });
      assertOk(result);
      expect(result.value).toBeNull();
    });
  });

  describe('When a user have Merit rewards to claim', () => {
    it.todo('Then they should be able to claim them');
  });
});
