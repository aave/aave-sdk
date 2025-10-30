import {
  assertOk,
  chainId,
  evmAddress,
  nonNullable,
  OrderDirection,
} from '@aave/client';
import { market, markets, userMarketState } from '@aave/client/actions';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
} from '@aave/client/test-utils';
import { describe, expect, it } from 'vitest';

describe('Given the Aave Protocol v3', () => {
  const wallet = createNewWallet();

  describe('When fetching markets by chain ID(s)', () => {
    it('Then it should return the expected data for each market', async () => {
      const result = await markets(client, {
        chainIds: [chainId(1)],
      });

      assertOk(result);

      // Sort by market name to make the snapshot stable
      const sortedMarkets = result.value.sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      sortedMarkets.forEach((market) => {
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

    it('Then it should support sorting supply reserves by APY', async () => {
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
        expect(apys[i]).toEqual(
          expect.objectContaining({
            apy: expect.toBeWithin(
              0,
              // expect.toBeWithin is wrongly typed but actually supports bigint
              (apys[i - 1]!.apy + 1n) as unknown as number,
            ),
          }),
        );
      }
    });

    it('Then it should support sorting borrow reserves by APY', async () => {
      const result = await market(client, {
        address: ETHEREUM_MARKET_ADDRESS,
        chainId: chainId(1),
        borrowsOrderBy: {
          borrowApy: OrderDirection.Desc,
        },
      }).map(nonNullable);

      assertOk(result);

      const apys = result.value.borrowReserves.map((r) => ({
        token: r.underlyingToken.symbol,
        apy: BigInt(r.borrowInfo!.apy.raw),
      }));

      for (let i = 1; i < apys.length; i++) {
        expect(apys[i]).toEqual(
          expect.objectContaining({
            apy: expect.toBeWithin(
              0,
              // expect.toBeWithin is wrongly typed but actually supports bigint
              (apys[i - 1]!.apy + 1n) as unknown as number,
            ),
          }),
        );
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
        currentLiquidationThreshold: expect.any(Object),
        ltv: expect.any(Object),
        netAPY: expect.any(Object),
        netWorth: expect.any(String),
        totalCollateralBase: expect.any(String),
        totalDebtBase: expect.any(String),
        userDebtAPY: expect.any(Object),
        userEarnedAPY: expect.any(Object),
      });
    });
  });
});
