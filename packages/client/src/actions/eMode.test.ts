import { assertOk, evmAddress, never, nonNullable } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  DEFAULT_MARKET_ADDRESS,
  DEFAULT_MARKET_EMODE_CATEGORY,
  ETHEREUM_FORK_ID,
} from '../test-utils';
import { sendWith } from '../viem';
import { market, userMarketState } from './markets';
import { userSetEmode } from './transactions';

describe('Given an Aave Market', () => {
  const wallet = createNewWallet();

  describe('When a user enables an E-Mode category for the given market', () => {
    beforeAll(async () => {
      const result = await userSetEmode(client, {
        chainId: ETHEREUM_FORK_ID,
        market: DEFAULT_MARKET_ADDRESS,
        categoryId: DEFAULT_MARKET_EMODE_CATEGORY,
        user: evmAddress(wallet.account!.address),
      }).andThen(sendWith(wallet));
      assertOk(result);
    });

    it('Then it should be reflected in their market user state', async () => {
      const result = await userMarketState(client, {
        market: DEFAULT_MARKET_ADDRESS,
        chainId: ETHEREUM_FORK_ID,
        user: evmAddress(wallet.account!.address),
      });
      assertOk(result);

      expect(result.value).toMatchObject({
        eModeEnabled: true,
      });
    });

    it("Then the market's reserves should have user state that reflects the selected E-Mode category settings", async () => {
      const result = await market(client, {
        address: DEFAULT_MARKET_ADDRESS,
        chainId: ETHEREUM_FORK_ID,
        user: evmAddress(wallet.account!.address),
      }).map(nonNullable);
      assertOk(result);

      const eModeCategory =
        result.value?.eModeCategories.find(
          (category) => category.id === DEFAULT_MARKET_EMODE_CATEGORY,
        ) ?? never('No eMode category found');
      for (let i = 0; i < result.value.supplyReserves.length; i++) {
        const reserve = result.value.supplyReserves[i] ?? never();
        const eModeCategoryReserve = eModeCategory.reserves.find(
          (r) => r.underlyingToken.address === reserve.underlyingToken.address,
        );

        expect(reserve).toMatchObject({
          userState: expect.objectContaining({
            canBeCollateral: eModeCategoryReserve?.canBeCollateral ?? false,
            canBeBorrowed: eModeCategoryReserve?.canBeBorrowed ?? false,
          }),
        });
      }
    });

    it('Then they should be able to disable it at any time', async () => {
      const result = await userSetEmode(client, {
        chainId: ETHEREUM_FORK_ID,
        market: DEFAULT_MARKET_ADDRESS,
        categoryId: null,
        user: evmAddress(wallet.account!.address),
      })
        .andThen(sendWith(wallet))
        .andThen(() =>
          userMarketState(client, {
            market: DEFAULT_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            user: evmAddress(wallet.account!.address),
          }),
        );
      assertOk(result);

      expect(result.value).toMatchObject({
        eModeEnabled: true,
      });
    });
  });
});
