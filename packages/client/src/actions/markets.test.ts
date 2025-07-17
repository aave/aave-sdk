import { OrderDirection } from '@aave/graphql';
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

    it('Then it should be possible to order the markets by tokenName', async () => {
      for (const order of Object.values(OrderDirection)) {
        const result = await markets(client, {
          chainIds: [ETHEREUM_FORK_ID],
          borrowsOrderBy: { tokenName: order },
          suppliesOrderBy: { tokenName: order },
        });

        assertOk(result);
        // TODO: Check the order
      }
    });

    it('Then it should be possible to order the markets by borrowApy', async () => {
      for (const order of Object.values(OrderDirection)) {
        const result = await markets(client, {
          chainIds: [ETHEREUM_FORK_ID],
          borrowsOrderBy: { borrowApy: order },
          suppliesOrderBy: { supplyApy: order },
        });

        assertOk(result);
        // TODO: Check the order
      }
    });

    it('Then it should be possible to order the markets by canBeCollateralized', async () => {
      for (const order of Object.values(OrderDirection)) {
        const result = await markets(client, {
          chainIds: [ETHEREUM_FORK_ID],
          borrowsOrderBy: { canBeCollateralized: order },
          suppliesOrderBy: { canBeCollateralized: order },
        });

        assertOk(result);
        // TODO: Check the order
      }
    });
  });
});
