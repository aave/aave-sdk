import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  fundErc20Address,
  WETH_ADDRESS,
} from '../test-utils';
import { sendWith } from '../viem';
import { collateralToggle, supply } from './transactions';
import { userSupplies } from './user';

describe('Given Aave Market', () => {
  describe('And a user with a supply position', () => {
    describe('When the user toggles the position as collateral', () => {
      const wallet = createNewWallet();

      beforeAll(async () => {
        await fundErc20Address(
          WETH_ADDRESS,
          evmAddress(wallet.account!.address),
          bigDecimal('0.02'),
        );
        console.log('funding done');

        const result = await supply(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          supplier: evmAddress(wallet.account!.address),
          amount: { erc20: { currency: WETH_ADDRESS, value: '0.01' } },
        })
          .andThen(sendWith(wallet))
          .andThen(client.waitForTransaction);
        assertOk(result);

        console.log('supply tx: ', result.value);
      });

      it('Then it should be reflected in the user supply positions', async () => {
        const userSuppliesBefore = await userSupplies(client, {
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          user: evmAddress(wallet.account!.address),
        });
        assertOk(userSuppliesBefore);

        // Toggle collateral
        const result = await collateralToggle(client, {
          market: ETHEREUM_MARKET_ADDRESS,
          chainId: ETHEREUM_FORK_ID,
          user: evmAddress(wallet.account!.address),
          underlyingToken: WETH_ADDRESS,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => console.log(`tx to toggle collateral: ${tx}`))
          .andThen(client.waitForTransaction);
        assertOk(result);

        const userSuppliesAfter = await userSupplies(client, {
          markets: [
            { address: ETHEREUM_MARKET_ADDRESS, chainId: ETHEREUM_FORK_ID },
          ],
          user: evmAddress(wallet.account!.address),
        });
        assertOk(userSuppliesAfter);
        expect(userSuppliesAfter.value).toEqual([
          expect.objectContaining({
            isCollateral: expect.toBe(
              !userSuppliesBefore.value[0]?.isCollateral,
            ),
          }),
        ]);
      }, 25_000);
    });
  });
});
