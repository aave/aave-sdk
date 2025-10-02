import { assertOk, chainId, evmAddress } from '@aave/client';
import { userMeritRewards } from '@aave/client/actions';
import { client, createNewWallet } from '@aave/client/test-utils';
import { describe, expect, it } from 'vitest';

describe('Given a chain supporting Merit rewards', () => {
  const wallet = createNewWallet();

  describe('When a user does not have any Merit rewards', () => {
    it('Then they should not see any Merit rewards to claim', async () => {
      const result = await userMeritRewards(client, {
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
