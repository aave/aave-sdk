import { assertOk, bigDecimal, evmAddress } from '@aave/client';
import { permitTypedData, supply, userSupplies } from '@aave/client/actions';
import {
  client,
  createNewWallet,
  ETHEREUM_USDC_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
} from '@aave/client/test-utils';
import { sendWith, signERC20PermitWith } from '@aave/client/viem';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Given an Aave Market', () => {
  describe('When the user supplies tokens to a Reserve', () => {
    const user = createNewWallet();
    const amountToSupply = bigDecimal('0.01');

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_WETH_ADDRESS,
        evmAddress(user.account!.address),
        bigDecimal('0.02'),
      );
      assertOk(setup);
    });

    it(`Then it should be reflected in the user's supply positions`, async () => {
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

  describe('When the user supplies tokens to a Reserve in behalf of another address', () => {
    const user = createNewWallet();
    const anotherUser = createNewWallet();
    const amountToSupply = bigDecimal('100');

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_USDC_ADDRESS,
        evmAddress(user.account!.address),
        bigDecimal('200'),
        6,
      );
      assertOk(setup);
    });

    it('Then it should be reflected in the supply positions of the other address', async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
      annotate(`other user address: ${anotherUser.account!.address}`);
      // Check if the reserve is not frozen or paused
      const reserve = await fetchReserve(ETHEREUM_USDC_ADDRESS);
      expect(reserve.isFrozen).toBe(false);
      expect(reserve.isPaused).toBe(false);

      const result = await supply(client, {
        market: reserve.market.address,
        sender: evmAddress(user.account!.address),
        onBehalfOf: evmAddress(anotherUser.account!.address),
        amount: {
          erc20: {
            value: amountToSupply,
            currency: ETHEREUM_USDC_ADDRESS,
          },
        },
        chainId: reserve.market.chain.chainId,
      })
        .andThen(sendWith(user))
        .andTee((tx) => annotate(`supply tx: ${tx.txHash}`))
        .andThen(client.waitForTransaction)
        .andThen(() =>
          userSupplies(client, {
            markets: [
              {
                address: reserve.market.address,
                chainId: reserve.market.chain.chainId,
              },
            ],
            user: evmAddress(anotherUser.account!.address),
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

  describe('When the user supplies tokens to the Reserve with a permit signature', () => {
    const user = createNewWallet();
    const amountToSupply = bigDecimal('100');

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_USDC_ADDRESS,
        evmAddress(user.account!.address),
        bigDecimal('200'),
        6,
      );
      assertOk(setup);
    });

    it('Then it should allow to supply tokens to the Reserve without needing for an ERC20 Approval transaction', async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
      const reserve = await fetchReserve(ETHEREUM_USDC_ADDRESS);
      expect(reserve.permitSupported).toBe(true);

      const signature = await permitTypedData(client, {
        currency: reserve.underlyingToken.address,
        amount: amountToSupply,
        chainId: reserve.market.chain.chainId,
        spender: reserve.market.address,
        owner: evmAddress(user.account!.address),
      }).andThen(signERC20PermitWith(user));
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
        .andTee((tx) => annotate(`tx plan: ${JSON.stringify(tx, null, 2)}`))
        .andTee((tx) => expect(tx.__typename).toEqual('TransactionRequest'))
        .andThen(sendWith(user))
        .andTee((tx) => annotate(`tx: ${tx.txHash}`))
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

  describe('When the user supplies tokens to a Reserve in behalf of another address with a permit signature', () => {
    const user = createNewWallet();
    const anotherUser = createNewWallet();
    const amountToSupply = bigDecimal('100');

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_USDC_ADDRESS,
        evmAddress(user.account!.address),
        bigDecimal('200'),
        6,
      );
      assertOk(setup);
    });
    it(`Then it should be reflected in the other user's supply positions`, async ({
      annotate,
    }) => {
      annotate(`another user address: ${anotherUser.account!.address}`);
      annotate(`user address: ${user.account!.address}`);
      const reserve = await fetchReserve(ETHEREUM_USDC_ADDRESS);
      expect(reserve.permitSupported).toBe(true);

      const signature = await permitTypedData(client, {
        currency: reserve.underlyingToken.address,
        amount: amountToSupply,
        chainId: reserve.market.chain.chainId,
        spender: reserve.market.address,
        owner: evmAddress(user.account!.address),
      }).andThen(signERC20PermitWith(user));
      assertOk(signature);

      const result = await supply(client, {
        market: reserve.market.address,
        sender: evmAddress(user.account!.address),
        onBehalfOf: evmAddress(anotherUser.account!.address),
        amount: {
          erc20: {
            value: amountToSupply,
            currency: reserve.underlyingToken.address,
            permitSig: signature.value,
          },
        },
        chainId: reserve.market.chain.chainId,
      })
        .andTee((tx) => annotate(`tx plan: ${JSON.stringify(tx, null, 2)}`))
        .andTee((tx) => expect(tx.__typename).toEqual('TransactionRequest'))
        .andThen(sendWith(user))
        .andTee((tx) => annotate(`supply tx: ${tx.txHash}`))
        .andThen(client.waitForTransaction)
        .andThen(() =>
          userSupplies(client, {
            markets: [
              {
                address: reserve.market.address,
                chainId: reserve.market.chain.chainId,
              },
            ],
            user: evmAddress(anotherUser.account!.address),
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
    describe('When the user supplies to the Reserve in native tokens', () => {
      const wallet = createNewWallet();
      const amountToSupply = bigDecimal('0.01');

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
