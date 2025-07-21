import type { Reserve } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import { supply } from './transactions';
import { userSupplies } from './user';

describe('Given an Aave Market', () => {
  describe('When the user supplies tokens to a Reserve', () => {
    const wallet = createNewWallet();
    const amountToSupply = '0.01';
    let reserveInfo: Reserve;

    beforeAll(async () => {
      await fundErc20Address(
        WETH_ADDRESS,
        evmAddress(wallet.account!.address),
        bigDecimal('0.02'),
      );

      reserveInfo = await fetchReserve(WETH_ADDRESS);
      // Check if the reserve is not frozen or paused
      expect(reserveInfo.isFrozen).toBe(false);
      expect(reserveInfo.isPaused).toBe(false);
    });

    it(`Then it should be available in the user's supply positions`, async () => {
      const result = await supply(client, {
        market: reserveInfo.market.address,
        supplier: evmAddress(wallet.account!.address),
        amount: {
          erc20: {
            value: amountToSupply,
            currency: WETH_ADDRESS,
          },
        },
        chainId: reserveInfo.market.chain.chainId,
      })
        .andThen(sendWith(wallet))
        .andThen(() =>
          userSupplies(client, {
            markets: [
              {
                address: reserveInfo.market.address,
                chainId: reserveInfo.market.chain.chainId,
              },
            ],
            user: evmAddress(wallet.account!.address),
          }),
        );
      assertOk(result);
      expect(result.value).toEqual([
        expect.objectContaining({
          balance: expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeBigDecimalCloseTo(amountToSupply),
            }),
          }),
        }),
      ]);
    }, 25_000);
  });

  describe('And the Reserve allows to supply in native tokens', () => {
    let reserveInfo: Reserve;

    beforeAll(async () => {
      reserveInfo = await fetchReserve(WETH_ADDRESS);
      // Check if the reserve is not frozen or paused
      expect(reserveInfo.isFrozen).toBe(false);
      expect(reserveInfo.isPaused).toBe(false);
      // And accepts native tokens
      expect(reserveInfo.acceptsNative?.symbol).toEqual('ETH');
    });

    describe('When the user supplies to the reserve in native tokens', () => {
      const wallet = createNewWallet();
      const amountToSupply = '0.01';

      beforeAll(async () => {
        await fundNativeAddress(
          evmAddress(wallet.account!.address),
          bigDecimal('0.02'),
        );
      });

      it(`Then it should be available in the user's supply positions`, async () => {
        const result = await supply(client, {
          market: reserveInfo.market.address,
          supplier: evmAddress(wallet.account!.address),
          amount: {
            native: amountToSupply,
          },
          chainId: reserveInfo.market.chain.chainId,
        })
          .andThen(sendWith(wallet))
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: reserveInfo.market.address,
                  chainId: reserveInfo.market.chain.chainId,
                },
              ],
              user: evmAddress(wallet.account!.address),
            }),
          );
        assertOk(result);
        expect(result.value).toEqual([
          expect.objectContaining({
            balance: expect.objectContaining({
              amount: expect.objectContaining({
                value: expect.toBeBigDecimalCloseTo(amountToSupply),
              }),
            }),
          }),
        ]);
      }, 25_000);
    });
  });
});
