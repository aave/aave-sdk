import { assertOk, chainId, evmAddress } from '@aave/types';
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

  describe('When fetching markets across one or more chains', () => {
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
