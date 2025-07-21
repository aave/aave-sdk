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
  fetchReserve,
  fundErc20Address,
  fundNativeAddress,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import { supply, withdraw } from './transactions';
import { userSupplies } from './user';

async function supplyAndGetUserSupplies(
  wallet: WalletClient,
  marketAddress: string,
  chainId: number,
  amount: SupplyRequest['amount'],
) {
  const userAddress = evmAddress(wallet.account!.address);
  const result = await supply(client, {
    market: marketAddress,
    supplier: userAddress,
    amount,
    chainId,
  })
    .andThen(sendWith(wallet))
    .andThen(() =>
      userSupplies(client, {
        markets: [{ address: marketAddress, chainId }],
        user: userAddress,
      }),
    );
  assertOk(result);
  return result.value;
}

async function withdrawAndGetUserSupplies(
  wallet: WalletClient,
  marketAddress: string,
  chainId: number,
  amount: WithdrawRequest['amount'],
) {
  const userAddress = evmAddress(wallet.account!.address);
  const result = await withdraw(client, {
    market: marketAddress,
    supplier: userAddress,
    amount,
    chainId,
  })
    .andThen(sendWith(wallet))
    .andThen(() =>
      userSupplies(client, {
        markets: [{ address: marketAddress, chainId }],
        user: userAddress,
      }),
    );
  assertOk(result);
  return result.value;
}

async function getUserSupplies(
  wallet: WalletClient,
  marketAddress: string,
  chainId: number,
) {
  const userAddress = evmAddress(wallet.account!.address);
  const userSuppliesRequest: UserSuppliesRequest = {
    markets: [{ address: marketAddress, chainId }],
    user: userAddress,
  };
  return userSupplies(client, userSuppliesRequest);
}

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

    beforeAll(async () => {
      // Create a new wallet and fund it with native token
      await fundNativeAddress(
        evmAddress(wallet.account!.address),
        amountToFund,
      );
    });

    it("Then it should be available in the user's supply positions", async () => {
      const result = await supplyAndGetUserSupplies(
        wallet,
        marketInfo.address,
        marketInfo.chain.chainId,
        {
          native: amountToSupply,
        },
      );
      expect(result).toEqual([
        expect.objectContaining({
          balance: expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeNumericStringCloseTo(Number(amountToSupply)),
            }),
          }),
        }),
      ]);
    }, 25_000);

    it('Then it should be possible to withdraw the position', async () => {
      // Supply if the user has no position
      const supplyInfo = await getUserSupplies(
        wallet,
        marketInfo.address,
        marketInfo.chain.chainId,
      );
      assertOk(supplyInfo);
      if (
        Number(supplyInfo.value[0]?.balance.amount.value) === 0 ||
        supplyInfo.value.length === 0
      ) {
        await supplyAndGetUserSupplies(
          wallet,
          marketInfo.address,
          marketInfo.chain.chainId,
          {
            native: amountToSupply,
          },
        );
      }

      const result = await withdrawAndGetUserSupplies(
        wallet,
        marketInfo.address,
        marketInfo.chain.chainId,
        {
          native: { value: supplyInfo.value[0]?.balance.amount.value },
        },
      );
      expect(result).toEqual([
        expect.objectContaining({
          balance: expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeNumericStringCloseTo(0),
            }),
          }),
        }),
      ]);
    }, 25_000);
  });

  describe('When supplying ERC-20 token to the corresponding reserve', () => {
    let reserveInfo: Reserve;
    const wallet = createNewWallet();
    const amountToFund = bigDecimal('1.0');
    const amountToSupply = '0.80';

    beforeAll(async () => {
      reserveInfo = await fetchReserve(WETH_ADDRESS);
      // Check if the reserve is not frozen or paused
      expect(reserveInfo.isFrozen).toBe(false);
      expect(reserveInfo.isPaused).toBe(false);

      // Fund the wallet with ERC-20 token
      await fundErc20Address(
        WETH_ADDRESS,
        evmAddress(wallet.account!.address),
        amountToFund,
      );
    });

    it("Then it should be available in the user's supply positions", async () => {
      const result = await supplyAndGetUserSupplies(
        wallet,
        reserveInfo.market.address,
        reserveInfo.market.chain.chainId,
        {
          erc20: {
            currency: WETH_ADDRESS,
            value: amountToSupply,
          },
        },
      );
      expect(result).toEqual([
        expect.objectContaining({
          balance: expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeNumericStringCloseTo(Number(amountToSupply)),
            }),
          }),
        }),
      ]);
    }, 25_000);

    it('Then it should be possible to withdraw the position', async () => {
      // Supply if the user has no position
      const supplyInfo = await getUserSupplies(
        wallet,
        reserveInfo.market.address,
        reserveInfo.market.chain.chainId,
      );
      assertOk(supplyInfo);
      if (
        Number(supplyInfo.value[0]?.balance.amount.value) === 0 ||
        supplyInfo.value.length === 0
      ) {
        await supplyAndGetUserSupplies(
          wallet,
          reserveInfo.market.address,
          reserveInfo.market.chain.chainId,
          {
            erc20: {
              currency: WETH_ADDRESS,
              value: amountToSupply,
            },
          },
        );
      }

      const result = await withdrawAndGetUserSupplies(
        wallet,
        reserveInfo.market.address,
        reserveInfo.market.chain.chainId,
        {
          erc20: {
            currency: WETH_ADDRESS,
            value: amountToSupply,
          },
        },
      );
      expect(result).toEqual([
        expect.objectContaining({
          balance: expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeNumericStringCloseTo(0),
            }),
          }),
        }),
      ]);
    }, 25_000);
  });
});
