import { OrderDirection } from '@aave/graphql';
import { assertOk, chainId, evmAddress, nonNullable } from '@aave/types';
import { describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
} from '../test-utils';
import { market, markets, userMarketState } from './markets';

describe('Given the Aave Protocol v3', () => {
  const wallet = createNewWallet();

  describe('When fetching markets by chain ID(s)', () => {
    it('Then it should return the expected data for each market', async () => {
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

  describe('When fetching a single market', () => {
    it('Then it should return the expected data for the market', async () => {
      const result = await market(client, {
        address: ETHEREUM_MARKET_ADDRESS,
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

    it('Then it should return supply reserves APYs in the expected order of magnitude', async () => {
      const result = await market(client, {
        address: ETHEREUM_MARKET_ADDRESS,
        chainId: chainId(1),
        suppliesOrderBy: {
          supplyApy: OrderDirection.Desc,
        },
      }).map(nonNullable);

      assertOk(result);

      const apys = result.value.supplyReserves.map((r) => ({
        token: r.underlyingToken.symbol,
        apy: BigInt(r.supplyInfo.apy.raw),
      }));

      for (let i = 1; i < apys.length; i++) {
        expect(apys[i]).toEqual({
          apy: expect.toBeInRange(0, apys[i - 1]!.apy),
        });
      }
    });
  });

  describe('When fetching user market state for a new user', () => {
    it('Then it should return the expected data for a user that has never interacted with the market', async () => {
      const result = await userMarketState(client, {
        market: ETHEREUM_MARKET_ADDRESS,
        chainId: ETHEREUM_FORK_ID,
        user: evmAddress(wallet.account!.address),
      });

      assertOk(result);
      expect(result.value).toMatchSnapshot({
        availableBorrowsBase: expect.any(String),
        currentLiquidationThreshold: expect.any(String),
        healthFactor: expect.any(String),
        ltv: expect.any(String),
        netAPY: expect.any(String),
        netWorth: expect.any(String),
        totalCollateralBase: expect.any(String),
        totalDebtBase: expect.any(String),
      });
    });
  });
});
