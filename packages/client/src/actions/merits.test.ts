import { assertOk, evmAddress } from '@aave/client';
import { client, createNewWallet } from '@aave/client/test-utils';
import { chainId } from '@aave/types';
import { describe, expect, it } from 'vitest';
import { meritClaimRewards } from './incentives';

describe('Given the Aave client', () => {
  describe('And a user with no merits', () => {
    const wallet = createNewWallet();

    describe('When the user wants to claim merits', () => {
      it('Then it should not return any merits to claim', async () => {
        const result = await meritClaimRewards(client, {
          user: evmAddress(wallet.account!.address),
          chainId: chainId(1),
        });
        assertOk(result);
        expect(result.value).toBeNull();
      });
    });

    describe('And a user with merits', () => {
      describe('When the user wants to claim merits', () => {
        it.todo('Then it should return the merits claimed');
      });
    });
  });
});
