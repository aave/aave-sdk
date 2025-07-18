import type {
  Reserve,
  SupplyRequest,
  UserSuppliesRequest,
  WithdrawRequest,
} from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import type { WalletClient } from 'viem';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  DEFAULT_MARKET_ADDRESS,
  ETHEREUM_FORK_ID,
  fundErc20Address,
  fundNativeAddress,
  getReserveInfo,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import { supply, withdraw } from './transactions';
import { userSupplies } from './user';

const supplyAndGetUserSupplies = async (
  requestSupply: SupplyRequest,
  wallet: WalletClient,
  userSuppliesRequest: UserSuppliesRequest,
) => {
  const result = await supply(client, requestSupply)
    .andThen(sendWith(wallet))
    .andThen(() => userSupplies(client, userSuppliesRequest));
  assertOk(result);
  return result.value;
};

const withdrawAndGetUserSupplies = async (
  requestWithdraw: WithdrawRequest,
  wallet: WalletClient,
  userSuppliesRequest: UserSuppliesRequest,
) => {
  const result = await withdraw(client, requestWithdraw)
    .andThen(sendWith(wallet))
    .andThen(() => userSupplies(client, userSuppliesRequest));
  assertOk(result);
  return result.value;
};

describe('Given the Aave Protocol v3 Market', () => {
  // Hardcoded market info for now
  const marketInfo = {
    address: DEFAULT_MARKET_ADDRESS,
    chain: { chainId: ETHEREUM_FORK_ID },
  };

  describe('When supplying native token to a reserve that accepts native token', () => {
    const wallet = createNewWallet();
    const amountToSupply = '0.90';
    const amountToFund = bigDecimal('1.0');
    const userSuppliesRequest: UserSuppliesRequest = {
      markets: [
        {
          address: marketInfo.address,
          chainId: marketInfo.chain.chainId,
        },
      ],
      user: evmAddress(wallet.account!.address),
    };

    beforeAll(async () => {
      // Create a new wallet and fund it with native token
      await fundNativeAddress(
        evmAddress(wallet.account!.address),
        amountToFund,
      );
    });

    it("Then it should be available in the user's supply positions", async () => {
      const result = await supplyAndGetUserSupplies(
        {
          market: marketInfo.address,
          supplier: evmAddress(wallet.account!.address),
          amount: {
            native: amountToSupply,
          },
          chainId: marketInfo.chain.chainId,
        },
        wallet,
        userSuppliesRequest,
      );
      expect(result).toEqual([
        expect.objectContaining({
          balance: expect.objectContaining({
            amount: expect.objectContaining({
              value: amountToSupply,
            }),
          }),
        }),
      ]);
    }, 25_000);

    it('Then it should be possible to withdraw the position', async () => {
      // Supply if the user has no position
      const supplyInfo = await userSupplies(client, userSuppliesRequest);
      assertOk(supplyInfo);
      if (
        Number(supplyInfo.value[0]?.balance.amount.value) === 0 ||
        supplyInfo.value.length === 0
      ) {
        await supplyAndGetUserSupplies(
          {
            market: marketInfo.address,
            supplier: wallet.account!.address,
            amount: {
              native: amountToSupply,
            },
            chainId: marketInfo.chain.chainId,
          },
          wallet,
          userSuppliesRequest,
        );
      }

      const result = await withdrawAndGetUserSupplies(
        {
          market: marketInfo.address,
          supplier: wallet.account!.address,
          amount: {
            native: { value: supplyInfo.value[0]?.balance.amount.value },
          },
          chainId: marketInfo.chain.chainId,
        },
        wallet,
        userSuppliesRequest,
      );
      expect(result).toEqual([
        expect.objectContaining({
          balance: expect.objectContaining({
            amount: expect.objectContaining({
              value: '0.00',
            }),
          }),
        }),
      ]);
    }, 25_000);
  });

  describe('When supplying ERC-20 token to the corresponding reserve', () => {
    let reserveInfo: Reserve;
    let userSuppliesRequest: UserSuppliesRequest;
    const wallet = createNewWallet();
    const amountToFund = bigDecimal('1.0');
    const amountToSupply = '0.80';

    beforeAll(async () => {
      reserveInfo = await getReserveInfo(WETH_ADDRESS);
      // Check if the reserve is not frozen or paused
      expect(reserveInfo.isFrozen).toBe(false);
      expect(reserveInfo.isPaused).toBe(false);

      userSuppliesRequest = {
        markets: [
          {
            address: reserveInfo.market.address,
            chainId: reserveInfo.market.chain.chainId,
          },
        ],
        user: evmAddress(wallet.account!.address),
      };

      // Fund the wallet with ERC-20 token
      await fundErc20Address(
        WETH_ADDRESS,
        evmAddress(wallet.account!.address),
        amountToFund,
      );
    });

    it("Then it should be available in the user's supply positions", async () => {
      const result = await supplyAndGetUserSupplies(
        {
          market: reserveInfo.market.address,
          supplier: wallet.account!.address,
          amount: {
            erc20: {
              currency: WETH_ADDRESS,
              value: amountToSupply,
            },
          },
          chainId: reserveInfo.market.chain.chainId,
        },
        wallet,
        userSuppliesRequest,
      );
      expect(result).toEqual([
        expect.objectContaining({
          balance: expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.any(String),
            }),
          }),
        }),
      ]);
      // Check that the value is close to the expected amount
      const actualValue = Number.parseFloat(
        result[0]?.balance.amount.value || '0',
      );
      const expectedValue = Number.parseFloat(amountToSupply.toString());
      expect(actualValue).toBeCloseTo(expectedValue, 2);
    }, 25_000);

    it('Then it should be possible to withdraw the position', async () => {
      // Supply if the user has no position
      const supplyInfo = await userSupplies(client, userSuppliesRequest);
      assertOk(supplyInfo);
      if (
        Number(supplyInfo.value[0]?.balance.amount.value) === 0 ||
        supplyInfo.value.length === 0
      ) {
        await supplyAndGetUserSupplies(
          {
            market: reserveInfo.market.address,
            supplier: wallet.account!.address,
            amount: {
              erc20: {
                currency: WETH_ADDRESS,
                value: amountToSupply,
              },
            },
            chainId: reserveInfo.market.chain.chainId,
          },
          wallet,
          userSuppliesRequest,
        );
      }

      const result = await withdrawAndGetUserSupplies(
        {
          market: reserveInfo.market.address,
          supplier: wallet.account!.address,
          amount: {
            erc20: {
              currency: WETH_ADDRESS,
              value: amountToSupply,
            },
          },
          chainId: reserveInfo.market.chain.chainId,
        },
        wallet,
        userSuppliesRequest,
      );
      expect(result).toEqual([
        expect.objectContaining({
          balance: expect.objectContaining({
            amount: expect.objectContaining({
              value: '0.00',
            }),
          }),
        }),
      ]);
    }, 25_000);
  });
});
