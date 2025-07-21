import { assertOk, chainId } from '@aave/types';
import { describe, expect, it } from 'vitest';
import {
  client,
  DEFAULT_MARKET_ADDRESS,
  ETHEREUM_FORK_ID,
} from '../test-utils';
import { market, markets } from './markets';

describe('Given the Aave Protocol v3', () => {
  describe('When fetching markets data', () => {
    it('Then it should be possible to fetch markets for a given chain ID', async () => {
      const result = await markets(client, {
        chainIds: [chainId(1)],
      });

      assertOk(result);

      result.value.forEach((market) => {
        expect(market).toMatchSnapshot({
          totalAvailableLiquidity: expect.any(String),
          totalMarketSize: expect.any(String),
          borrowReserves: expect.any(Array),
          supplyReserves: expect.any(Array),
          eModeCategories: expect.any(Array),
        });
      });
    });
  });
  describe('When fetching a market data for a given address', () => {
    it('Then it should be possible to fetch market data for a given address', async () => {
      const result = await market(client, {
        address: DEFAULT_MARKET_ADDRESS,
        chainId: ETHEREUM_FORK_ID,
      });

      assertOk(result);

      expect(result.value).toMatchSnapshot({
        totalAvailableLiquidity: expect.any(String),
        totalMarketSize: expect.any(String),
        borrowReserves: expect.any(Array),
        supplyReserves: expect.any(Array),
        eModeCategories: expect.any(Array),
      });
    });
  });
});
