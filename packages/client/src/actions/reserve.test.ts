import { assertOk, chainId, evmAddress } from '@aave/client';
import { TimeWindow } from '@aave/graphql';
import { describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
} from '../test-utils';
import { borrowAPYHistory, reserve, supplyAPYHistory } from './reserve';

function windowToDate(window: TimeWindow): Date {
  switch (window) {
    case TimeWindow.LastDay:
      return new Date(Date.now() - 1000 * 60 * 60 * 24 - 1000 * 60 * 10);
    case TimeWindow.LastWeek:
      return new Date(Date.now() - 1000 * 60 * 60 * 24 * 8);
    case TimeWindow.LastMonth:
      return new Date(Date.now() - 1000 * 60 * 60 * 24 * 31);
    case TimeWindow.LastSixMonths:
      return new Date(Date.now() - 1000 * 60 * 60 * 24 * 183);
    case TimeWindow.LastYear:
      return new Date(Date.now() - 1000 * 60 * 60 * 24 * 366);
    default:
      throw new Error(`Unknown window: ${window}`);
  }
}

describe('Given an Aave Market reserve', () => {
  const wallet = createNewWallet();
  const windowEnum = Object.values(TimeWindow);

  describe('When fetching the reserve data', () => {
    it('Then it should return the expected reserve details', async () => {
      const result = await reserve(client, {
        market: ETHEREUM_MARKET_ADDRESS,
        chainId: ETHEREUM_FORK_ID,
        underlyingToken: ETHEREUM_WETH_ADDRESS,
        user: evmAddress(wallet.account!.address),
      });
      assertOk(result);
      expect(result.value).toMatchSnapshot({
        aToken: expect.any(Object),
        underlyingToken: {
          address: ETHEREUM_WETH_ADDRESS,
        },
        vToken: expect.any(Object),
        supplyInfo: expect.any(Object),
        borrowInfo: expect.any(Object),
        eModeInfo: expect.any(Array),
        market: expect.any(Object),
        acceptsNative: expect.any(Object),
        size: expect.any(Object),
        userState: expect.any(Object),
      });
    });
  });

  describe('When fetching the borrow APY history for it', () => {
    it.each(windowEnum)(
      'Then it should return a time series for the specified window %s',
      async (window) => {
        const result = await borrowAPYHistory(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: chainId(1),
          underlyingToken: ETHEREUM_WETH_ADDRESS,
          window,
        });
        assertOk(result);
        expect(result.value?.length).toBeGreaterThan(0);
        for (const point of result.value!) {
          expect(point).toEqual(
            expect.objectContaining({
              date: expect.toBeBetweenDates(windowToDate(window), new Date()),
            }),
          );
        }
      },
    );
  });

  describe('When fetching the supply APY history for it', () => {
    it.each(windowEnum)(
      'Then it should return a time series for the specified window %s',
      async (window) => {
        const result = await supplyAPYHistory(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: chainId(1),
          underlyingToken: ETHEREUM_WETH_ADDRESS,
          window,
        });
        assertOk(result);
        expect(result.value?.length).toBeGreaterThan(0);
        expect(result.value).toEqual(
          result.value?.map(() =>
            expect.objectContaining({
              date: expect.toBeBetweenDates(windowToDate(window), new Date()),
            }),
          ),
        );
      },
    );
  });
});
