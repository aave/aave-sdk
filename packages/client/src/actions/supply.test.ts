import type { Market } from '@aave/graphql';
import { assertOk, bigDecimal, evmAddress, invariant } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  fundErc20Address,
  fundNativeAddress,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import { markets } from './markets';
import { supply } from './transactions';
import { userSupplies } from './user';

describe('Given the Aave Protocol v3', () => {
  describe('When supplying assets in an available market', () => {
    let marketInfo: Market;

    beforeAll(async () => {
      const result = await markets(client, {
        chainIds: [ETHEREUM_FORK_ID],
      });
      assertOk(result);

      // Check market is available to supply
      for (const market of result.value) {
        // TODO: Remove once I can supply to a random market
        if (market.address === '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2') {
          marketInfo = market;
          return;
        }
      }
    });

    it('Then it should be possible to supply NATIVE asset to a market', async () => {
      const result = await createNewWallet()
        .andThen((wallet) =>
          fundNativeAddress(
            evmAddress(wallet.account!.address),
            bigDecimal('1'),
          )
            .map(() => wallet)
        )
        .andThen((wallet) =>
          supply(client, {
            market: marketInfo.address,
            supplier: evmAddress(wallet.account!.address),
            amount: {
              native: bigDecimal('0.9'),
            },
            chainId: marketInfo.chain.chainId,
          })
            .andThen(sendWith(wallet))
            // Wait for propagation of the tx to the network
            .andTee(() => new Promise((resolve) => setTimeout(resolve, 2000)))
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
            ),
        );
      assertOk(result);
      invariant(result.value, 'No result');

      expect(result.value.length).toEqual(1);
      expect(result.value[0]!.balance.amount.value).toEqual(bigDecimal('0.90'));
      expect(result.value[0]!.isCollateral).toEqual(true);
      expect(result.value[0]!.canBeCollateral).toEqual(true);
    });

    it('Then it should be possible to supply ERC20 asset to a market', async () => {
      const result = await createNewWallet()
        .andThen((wallet) =>
          fundErc20Address(
            WETH_ADDRESS,
            evmAddress(wallet.account!.address),
            bigDecimal('1'),
          )
            .map(() => wallet)
        )
        .andThen((wallet) =>
          supply(client, {
            market: marketInfo.address,
            supplier: evmAddress(wallet.account!.address),
            amount: {
              erc20: {
                currency: WETH_ADDRESS,
                value: bigDecimal('0.7'),
              },
            },
            chainId: marketInfo.chain.chainId,
          })
            .andThen(sendWith(wallet))
            // Wait for propagation of the tx to the network
            .andTee(() => new Promise((resolve) => setTimeout(resolve, 5000)))
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
            ),
        );
      assertOk(result);
      invariant(result.value, 'No result');

      expect(result.value.length).toEqual(1);
      expect(result.value[0]!.balance.amount.value).toEqual(bigDecimal('0.70'));
      expect(result.value[0]!.isCollateral).toEqual(true);
      expect(result.value[0]!.canBeCollateral).toEqual(true);
    });
  });
});
