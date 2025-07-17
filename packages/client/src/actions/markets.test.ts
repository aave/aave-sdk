import { assertOk } from '@aave/types';
import { describe, expect, it } from 'vitest';
import { client, ETHEREUM_FORK_ID } from '../test-utils';
import { markets } from './markets';

describe('Given the Aave Protocol v3', () => {
  describe('When fetching markets data', () => {
    it('Then it should be possible to fetch markets for a given chain ID', async () => {
      const result = await markets(client, {
        chainIds: [ETHEREUM_FORK_ID],
      });

      assertOk(result);

      result.value.forEach((market) => {
        expect(market).toMatchSnapshot({
          totalMarketSize: expect.any(String),
          borrowReserves: expect.any(Array),
          supplyReserves: expect.any(Array),
          eModeCategories: expect.any(Array),
        });
      });
    });
  });
});
