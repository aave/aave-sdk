import { assertOk, evmAddress } from '@aave/client';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_USDC_ADDRESS,
} from '@aave/client/test-utils';
import { describe, expect, it } from 'vitest';
import { userMarketState } from './markets';
import { healthFactorPreview } from './misc';

describe('Given the Aave client', () => {
  describe('And a user without supply/borrow positions', () => {
    const wallet = createNewWallet();

    describe('When the user wants to preview the health factor after supplying USDC', () => {
      it('Then it should return the maximum health factor in the preview response', async () => {
        const userMarketStateResult = await userMarketState(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          user: evmAddress(wallet.account!.address),
        });
        assertOk(userMarketStateResult);

        const result = await healthFactorPreview(client, {
          action: {
            supply: {
              market: ETHEREUM_MARKET_ADDRESS,
              chainId: ETHEREUM_FORK_ID,
              sender: evmAddress(wallet.account!.address),
              amount: {
                erc20: {
                  currency: ETHEREUM_USDC_ADDRESS,
                  value: '10',
                },
              },
            },
          },
        });
        assertOk(result);
        // User with no supply/borrow positions has a health factor of 0
        expect(Number(result.value.before)).toEqual(0);
        // TODO: To be determined what is the maximum health factor
        expect(Number(result.value.after)).toBeGreaterThan(1);
      });
    });
  });
});
