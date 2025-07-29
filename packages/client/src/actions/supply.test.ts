import type { Reserve } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
  USDC_ADDRESS,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith, signWith } from '../viem';
import { permitTypedData, supply } from './transactions';
import { userSupplies } from './user';

describe('Given an Aave Market', () => {
  describe('When the user supplies tokens to a Reserve', () => {
    const wallet = createNewWallet();
    const amountToSupply = '0.01';
    let reserve: Reserve;

    beforeAll(async () => {
      await fundErc20Address(
        WETH_ADDRESS,
        evmAddress(wallet.account!.address),
        bigDecimal('0.02'),
      );

      reserve = await fetchReserve(WETH_ADDRESS);
      // Check if the reserve is not frozen or paused
      expect(reserve.isFrozen).toBe(false);
      expect(reserve.isPaused).toBe(false);
    });

    it(`Then it should be available in the user's supply positions`, async () => {
      const result = await supply(client, {
        market: reserve.market.address,
        supplier: evmAddress(wallet.account!.address),
        amount: {
          erc20: {
            value: amountToSupply,
            currency: WETH_ADDRESS,
          },
        },
        chainId: reserve.market.chain.chainId,
      })
        .andThen(sendWith(wallet))
        .andThen(client.waitForTransaction)
        .andThen(() =>
          userSupplies(client, {
            markets: [
              {
                address: reserve.market.address,
                chainId: reserve.market.chain.chainId,
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

  describe.only('When the user supplies token to the Reserve via a permit signature', () => {
    const owner = createNewWallet();
    const user = createNewWallet();
    const amountToSupply = '1.5';

    beforeAll(async () => {
      await fundErc20Address(
        USDC_ADDRESS,
        evmAddress(owner.account!.address),
        bigDecimal('0.02'),
      );

      await fundNativeAddress(
        evmAddress(user.account!.address),
        bigDecimal('0.02'),
      );
    });

    it('Then it should allow the user to supply tokens to the Reserve', async () => {
      const reserve = await fetchReserve(USDC_ADDRESS);
      expect(reserve.permitSupported).toBe(true);

      const signature = await permitTypedData(client, {
        market: reserve.market.address,
        underlyingToken: reserve.underlyingToken.address,
        amount: amountToSupply,
        chainId: reserve.market.chain.chainId,
        spender: evmAddress(user.account!.address),
        owner: evmAddress(owner.account!.address),
      }).andThen(signWith(owner));
      assertOk(signature);

      const result = await supply(client, {
        market: reserve.market.address,
        supplier: evmAddress(user.account!.address),
        amount: {
          erc20: {
            value: amountToSupply,
            currency: reserve.underlyingToken.address,
            erc712: signature.value,
          },
        },
        chainId: reserve.market.chain.chainId,
      })
        .andThen(sendWith(user))
        .andThen(client.waitForTransaction)
        .andThen(() =>
          userSupplies(client, {
            markets: [reserve.market.address],
            user: evmAddress(user.account!.address),
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
    });
  });

  describe('And the Reserve allows to supply in native tokens', () => {
    const wallet = createNewWallet();
    let reserve: Reserve;

    beforeAll(async () => {
      reserve = await fetchReserve(WETH_ADDRESS);
      // Check if the reserve is not frozen or paused
      expect(reserve.isFrozen).toBe(false);
      expect(reserve.isPaused).toBe(false);
      // And accepts native tokens
      expect(reserve.acceptsNative?.symbol).toEqual('ETH');
    });

    describe('When the user supplies to the reserve in native tokens', () => {
      const amountToSupply = '0.01';

      beforeAll(async () => {
        await fundNativeAddress(
          evmAddress(wallet.account!.address),
          bigDecimal('0.02'),
        );
      });

      it(`Then it should be available in the user's supply positions`, async () => {
        const result = await supply(client, {
          market: reserve.market.address,
          supplier: evmAddress(wallet.account!.address),
          amount: {
            native: amountToSupply,
          },
          chainId: reserve.market.chain.chainId,
        })
          .andThen(sendWith(wallet))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: reserve.market.address,
                  chainId: reserve.market.chain.chainId,
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
