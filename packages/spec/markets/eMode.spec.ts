import { assertOk, evmAddress, never, nonNullable } from '@aave/client';
import { market, userMarketState, userSetEmode } from '@aave/client/actions';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY,
} from '@aave/client/test-utils';
import { sendWith } from '@aave/client/viem';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Given an Aave Market', () => {
  describe('When a user enables an E-Mode category for the given market', () => {
    const wallet = createNewWallet();

    beforeAll(async () => {
      const result = await userSetEmode(client, {
        chainId: ETHEREUM_FORK_ID,
        market: ETHEREUM_MARKET_ADDRESS,
        categoryId: ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY,
        user: evmAddress(wallet.account!.address),
      })
        .andThen(sendWith(wallet))
        .andThen(client.waitForTransaction);
      assertOk(result);
    });

    it('Then it should be reflected in their market user state', async () => {
      const result = await userMarketState(client, {
        market: ETHEREUM_MARKET_ADDRESS,
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
        address: ETHEREUM_MARKET_ADDRESS,
        chainId: ETHEREUM_FORK_ID,
        user: evmAddress(wallet.account!.address),
      }).map(nonNullable);
      assertOk(result);

      const eModeCategory =
        result.value?.eModeCategories.find(
          (category) =>
            category.id === ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY,
        ) ?? never('No eMode category found');
      for (let i = 0; i < result.value.supplyReserves.length; i++) {
        const reserve = result.value.supplyReserves[i] ?? never();
        const eModeCategoryReserve = eModeCategory.reserves.find(
          (r) => r.underlyingToken.address === reserve.underlyingToken.address,
        );

        expect(reserve).toMatchObject({
          userState: expect.objectContaining({
            canBeBorrowed: eModeCategoryReserve?.canBeBorrowed ?? false,
          }),
        });
      }
    });

    it('Then they should be able to disable it at any time', async () => {
      const result = await userSetEmode(client, {
        chainId: ETHEREUM_FORK_ID,
        market: ETHEREUM_MARKET_ADDRESS,
        categoryId: null,
        user: evmAddress(wallet.account!.address),
      })
        .andThen(sendWith(wallet))
        .andThen(client.waitForTransaction)
        .andThen(() =>
          userMarketState(client, {
            market: ETHEREUM_MARKET_ADDRESS,
            chainId: ETHEREUM_FORK_ID,
            user: evmAddress(wallet.account!.address),
          }),
        );
      assertOk(result);

      expect(result.value).toMatchObject({
        eModeEnabled: false,
      });
    });
  });
});
