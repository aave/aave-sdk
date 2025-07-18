import type { Reserve } from '@aave/graphql';
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

describe('Given the Aave Protocol v3 Market', () => {
  // Hardcoded market info for now
  const marketInfo = {
    address: DEFAULT_MARKET_ADDRESS,
    chain: { chainId: ETHEREUM_FORK_ID },
  };

  describe('When supplying native token to a reserve that accepts native token', () => {
    let wallet: WalletClient;

    beforeAll(async () => {
      // Create a new wallet and fund it with native token
      const result = await createNewWallet().andTee((wallet) =>
        fundNativeAddress(evmAddress(wallet.account!.address), bigDecimal('1')),
      );
      assertOk(result);
      wallet = result.value;
    });

    it("Then it should be available in the user's supply positions", async () => {
      const result = await supply(client, {
        market: marketInfo.address,
        supplier: evmAddress(wallet.account!.address),
        amount: {
          native: bigDecimal('0.9'),
        },
        chainId: marketInfo.chain.chainId,
      })
        .andThen(sendWith(wallet))
        .andThen(() =>
          userSupplies(client, {
            markets: [
              {
                address: marketInfo.address,
                chainId: marketInfo.chain.chainId,
              },
            ],
            user: evmAddress(wallet.account!.address),
          }),
        );
      assertOk(result);
      expect(result.value.length).toEqual(1);
      expect(result.value[0]?.balance.amount.value).toEqual(bigDecimal('0.90'));
    }, 25_000);

    it('Then it should be possible to withdraw the position', async () => {
      // First check if the user has a position
      const supplyInfo = await userSupplies(client, {
        markets: [
          {
            address: marketInfo.address,
            chainId: marketInfo.chain.chainId,
          },
        ],
        user: evmAddress(wallet.account!.address),
      });
      assertOk(supplyInfo);
      expect(Number(supplyInfo.value[0]?.balance.amount.value)).toBeGreaterThan(0);

      const result = await withdraw(client, {
        market: marketInfo.address,
        supplier: wallet.account!.address,
        amount: {
          native: { value: supplyInfo.value[0]?.balance.amount.value },
        },
        chainId: marketInfo.chain.chainId,
      })
        .andThen(sendWith(wallet))
        .andThen(() =>
          userSupplies(client, {
            markets: [
              {
                address: marketInfo.address,
                chainId: marketInfo.chain.chainId,
              },
            ],
            user: evmAddress(wallet.account!.address),
          }),
        );
      assertOk(result);
      expect(result.value.length).toEqual(1);
      expect(result.value[0]?.balance.amount.value).toEqual(bigDecimal('0.00'));
    }, 25_000);
  });

  describe('When supplying ERC-20 token to the corresponding reserve', () => {
    let wallet: WalletClient;
    let reserveInfo: Reserve;

    beforeAll(async () => {
      reserveInfo = await getReserveInfo(WETH_ADDRESS);
      // Check if the reserve is not frozen or paused
      expect(reserveInfo.isFrozen).toBe(false);
      expect(reserveInfo.isPaused).toBe(false);

      // Create a new wallet and fund it with ERC-20 token
      const result = await createNewWallet().andTee((wallet) =>
        fundErc20Address(
          WETH_ADDRESS,
          evmAddress(wallet.account!.address),
          bigDecimal('1'),
        ),
      );
      assertOk(result);
      wallet = result.value;
    });

    it("Then it should be available in the user's supply positions", async () => {
      const result = await supply(client, {
        market: reserveInfo.market.address,
        supplier: evmAddress(wallet.account!.address),
        amount: {
          erc20: {
            currency: WETH_ADDRESS,
            value: bigDecimal('0.7'),
          },
        },
        chainId: reserveInfo.market.chain.chainId,
      })
        .andThen(sendWith(wallet))
        .andThen(() =>
          userSupplies(client, {
            markets: [
              {
                address: marketInfo.address,
                chainId: marketInfo.chain.chainId,
              },
            ],
            user: evmAddress(wallet.account!.address),
          }),
        );
      assertOk(result);

      expect(result.value.length).toEqual(1);
      expect(result.value[0]?.balance.amount.value).toEqual(bigDecimal('0.70'));
    }, 25_000);

    it('Then it should be possible to withdraw the position', async () => {
      const result = await withdraw(client, {
        market: reserveInfo.market.address,
        supplier: wallet.account!.address,
        amount: {
          erc20: {
            currency: WETH_ADDRESS,
            value: bigDecimal('0.7'),
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
      expect(result.value.length).toEqual(1);
      expect(result.value[0]?.balance.amount.value).toEqual(bigDecimal('0.00'));
    }, 25_000);
  });
});
