import {
  assertOk,
  bigDecimal,
  evmAddress,
  never,
  nonNullable,
} from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY,
  fundErc20Address,
  USDC_ADDRESS,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import { market, userMarketState } from './markets';
import { supply, userSetEmode } from './transactions';
import { userSupplies } from './user';

describe('Given an Aave Market', () => {
  describe('When a user enables an E-Mode category for the given market', () => {
    const wallet = createNewWallet();

    beforeAll(async () => {
      const result = await userSetEmode(client, {
        chainId: ETHEREUM_FORK_ID,
        market: ETHEREUM_MARKET_ADDRESS,
        categoryId: ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY,
        user: evmAddress(wallet.account!.address),
      }).andThen(sendWith(wallet));
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

  describe('And the user has some supply positions', () => {
    const wallet = createNewWallet();

    beforeAll(async () => {
      await Promise.all([
        fundErc20Address(
          USDC_ADDRESS,
          evmAddress(wallet.account!.address),
          bigDecimal('0.02'),
        ),
        fundErc20Address(
          WETH_ADDRESS,
          evmAddress(wallet.account!.address),
          bigDecimal('0.02'),
        ),
      ]);

      const result = await supply(client, {
        chainId: ETHEREUM_FORK_ID,
        market: ETHEREUM_MARKET_ADDRESS,
        supplier: evmAddress(wallet.account!.address),
        amount: {
          erc20: {
            currency: USDC_ADDRESS,
            value: '0.01',
          },
        },
      })
        .andThen(sendWith(wallet))
        .andThen(() =>
          supply(client, {
            chainId: ETHEREUM_FORK_ID,
            market: ETHEREUM_MARKET_ADDRESS,
            supplier: evmAddress(wallet.account!.address),
            amount: {
              erc20: {
                currency: WETH_ADDRESS,
                value: '0.01',
              },
            },
          }),
        )
        .andThen(sendWith(wallet));

      assertOk(result);
    });

    describe('When the user enables an E-Mode category involving some of the supply positions', () => {
      beforeAll(async () => {
        const result = await userSetEmode(client, {
          chainId: ETHEREUM_FORK_ID,
          market: ETHEREUM_MARKET_ADDRESS,
          categoryId: ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY,
          user: evmAddress(wallet.account!.address),
        }).andThen(sendWith(wallet));
        assertOk(result);
      });
    });
  });
});
