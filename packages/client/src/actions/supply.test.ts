import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_USDC_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
} from '../test-utils';
import { sendWith, signERC20PermitWith } from '../viem';
import { permitTypedData } from './permits';
import { supply } from './transactions';
import { userSupplies } from './user';

describe('Given an Aave Market', () => {
  describe('When the user supplies tokens to a Reserve', () => {
    const user = createNewWallet();
    const amountToSupply = '0.01';

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_WETH_ADDRESS,
        evmAddress(user.account!.address),
        bigDecimal('0.02'),
      );
      assertOk(setup);
    });

    it(`Then it should be available in the user's supply positions`, async () => {
      // Check if the reserve is not frozen or paused
      const reserve = await fetchReserve(ETHEREUM_WETH_ADDRESS);
      expect(reserve.isFrozen).toBe(false);
      expect(reserve.isPaused).toBe(false);

      const result = await supply(client, {
        market: reserve.market.address,
        sender: evmAddress(user.account!.address),
        amount: {
          erc20: {
            value: amountToSupply,
            currency: ETHEREUM_WETH_ADDRESS,
          },
        },
        chainId: reserve.market.chain.chainId,
      })
        .andThen(sendWith(user))
        .andThen(client.waitForTransaction)
        .andThen(() =>
          userSupplies(client, {
            markets: [
              {
                address: reserve.market.address,
                chainId: reserve.market.chain.chainId,
              },
            ],
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

  describe('When the user supplies token to the Reserve via a permit signature', () => {
    const owner = createNewWallet();
    const user = createNewWallet();
    const amountToSupply = '1.5';

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_USDC_ADDRESS,
        evmAddress(owner.account!.address),
        bigDecimal('0.02'),
      ).andThen(() =>
        fundNativeAddress(
          evmAddress(user.account!.address),
          bigDecimal('0.02'),
        ),
      );
      assertOk(setup);
    });
    it('Then it should allow the user to supply tokens to the Reserve', async () => {
      const reserve = await fetchReserve(ETHEREUM_USDC_ADDRESS);
      expect(reserve.permitSupported).toBe(true);

      const signature = await permitTypedData(client, {
        market: reserve.market.address,
        underlyingToken: reserve.underlyingToken.address,
        amount: amountToSupply,
        chainId: reserve.market.chain.chainId,
        spender: evmAddress(user.account!.address),
        owner: evmAddress(owner.account!.address),
      }).andThen(signERC20PermitWith(owner));
      assertOk(signature);

      const result = await supply(client, {
        market: reserve.market.address,
        sender: evmAddress(user.account!.address),
        amount: {
          erc20: {
            value: amountToSupply,
            currency: reserve.underlyingToken.address,
            permitSig: signature.value,
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
      const wallet = createNewWallet();
      const amountToSupply = '0.01';

      beforeAll(async () => {
        const setup = await fundNativeAddress(
          evmAddress(wallet.account!.address),
          bigDecimal('0.02'),
        );
        assertOk(setup);
      });

      it(`Then it should be available in the user's supply positions`, async () => {
        // Check if the reserve is not frozen or paused and accepts native tokens
        const reserve = await fetchReserve(ETHEREUM_WETH_ADDRESS);
        expect(reserve.isFrozen).toBe(false);
        expect(reserve.isPaused).toBe(false);
        expect(reserve.acceptsNative?.symbol).toEqual('ETH');

        const result = await supply(client, {
          market: reserve.market.address,
          sender: evmAddress(wallet.account!.address),
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
      });
    });
  });
});
