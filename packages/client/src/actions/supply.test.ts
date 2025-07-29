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
    const userSupplyErc20 = createNewWallet();
    const amountToSupply = '0.01';

    it(`Then it should be available in the user's supply positions`, async () => {
      const setup = await fundErc20Address(
        WETH_ADDRESS,
        evmAddress(userSupplyErc20.account!.address),
        bigDecimal('0.02'),
      );
      assertOk(setup);
      // Check if the reserve is not frozen or paused
      const reserve = await fetchReserve(WETH_ADDRESS);
      expect(reserve.isFrozen).toBe(false);
      expect(reserve.isPaused).toBe(false);

      const result = await supply(client, {
        market: reserve.market.address,
        supplier: evmAddress(userSupplyErc20.account!.address),
        amount: {
          erc20: {
            value: amountToSupply,
            currency: WETH_ADDRESS,
          },
        },
        chainId: reserve.market.chain.chainId,
      })
        .andThen(sendWith(userSupplyErc20))
        .andThen(client.waitForTransaction)
        .andThen(() =>
          userSupplies(client, {
            markets: [
              {
                address: reserve.market.address,
                chainId: reserve.market.chain.chainId,
              },
            ],
            user: evmAddress(userSupplyErc20.account!.address),
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

  describe('When the user supplies token to the Reserve via a permit signature', () => {
    const owner = createNewWallet();
    const user = createNewWallet();
    const amountToSupply = '1.5';

    it('Then it should allow the user to supply tokens to the Reserve', async () => {
      const setup = await fundErc20Address(
        USDC_ADDRESS,
        evmAddress(owner.account!.address),
        bigDecimal('0.02'),
      ).andThen(() =>
        fundNativeAddress(
          evmAddress(user.account!.address),
          bigDecimal('0.02'),
        ),
      );
      assertOk(setup);

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
    describe('When the user supplies to the reserve in native tokens', () => {
      const userSupplyNative = createNewWallet();
      const amountToSupply = '0.01';

      it(`Then it should be available in the user's supply positions`, async () => {
        const setup = await fundNativeAddress(
          evmAddress(userSupplyNative.account!.address),
          bigDecimal('0.02'),
        );
        assertOk(setup);

        // Check if the reserve is not frozen or paused and accepts native tokens
        const reserve = await fetchReserve(WETH_ADDRESS);
        expect(reserve.isFrozen).toBe(false);
        expect(reserve.isPaused).toBe(false);
        expect(reserve.acceptsNative?.symbol).toEqual('ETH');

        const result = await supply(client, {
          market: reserve.market.address,
          supplier: evmAddress(userSupplyNative.account!.address),
          amount: {
            native: amountToSupply,
          },
          chainId: reserve.market.chain.chainId,
        })
          .andThen(sendWith(userSupplyNative))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            userSupplies(client, {
              markets: [
                {
                  address: reserve.market.address,
                  chainId: reserve.market.chain.chainId,
                },
              ],
              user: evmAddress(userSupplyNative.account!.address),
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
