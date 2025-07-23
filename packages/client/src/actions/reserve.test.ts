import { assertOk, evmAddress } from '@aave/client';
import { TimeWindow } from '@aave/graphql';
import { describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  WETH_ADDRESS,
} from '../test-utils';
import { borrowAPYHistory, reserve, supplyAPYHistory } from './reserve';

describe('Given the Aave client', () => {
  const wallet = createNewWallet();

  describe('When fetching the reserve information for an asset', () => {
    it('Then it should return the reserve information for the asset', async () => {
      const result = await reserve(client, {
        market: ETHEREUM_MARKET_ADDRESS,
        chainId: ETHEREUM_FORK_ID,
        underlyingToken: WETH_ADDRESS,
        user: evmAddress(wallet.account!.address),
      });
      assertOk(result);
      expect(result.value).toMatchSnapshot({
        aToken: expect.any(Object),
        underlyingToken: {
          address: WETH_ADDRESS,
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

  describe('When fetching the borrow APY data for a given underlying asset ', () => {
    it('Then it should return the borrow APY data for the asset', async () => {
      const result = await borrowAPYHistory(client, {
        market: ETHEREUM_MARKET_ADDRESS,
        chainId: ETHEREUM_FORK_ID,
        underlyingToken: WETH_ADDRESS,
        window: TimeWindow.LastDay,
      });
      assertOk(result);
      expect(result.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            avgRate: expect.any(Object),
            date: expect.any(String),
          }),
        ]),
      );
    });
  });

  describe('When fetching the supply APY data for a given underlying asset ', () => {
    it('Then it should return the supply APY data for the asset', async () => {
      const result = await supplyAPYHistory(client, {
        market: ETHEREUM_MARKET_ADDRESS,
        chainId: ETHEREUM_FORK_ID,
        underlyingToken: WETH_ADDRESS,
        window: TimeWindow.LastDay,
      });
      assertOk(result);
      expect(result.value).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            avgRate: expect.any(Object),
            date: expect.any(String),
          }),
        ]),
      );
    });
  });
});
