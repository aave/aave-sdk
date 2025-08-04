import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_WETH_ADDRESS,
  fetchReserve,
  fundErc20Address,
} from '../test-utils';
import { sendWith } from '../viem';
import { supply, withdraw } from './transactions';

describe('Check Cache in Reserve', () => {
  describe('When the user supplies tokens to the Reserve', () => {
    const wallet = createNewWallet();
    const amountToSupply = '0.1';

    beforeAll(async () => {
      // Fund the wallet with WETH
      await fundErc20Address(
        ETHEREUM_WETH_ADDRESS,
        evmAddress(wallet.account!.address),
        bigDecimal('0.2'),
      );
    });

    describe('When the user withdraws part of their supply', () => {
      it('Then it should be reflected in the user supply positions', async ({
        annotate,
      }) => {
        const reserve = await fetchReserve(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(wallet.account!.address),
        );
        // Check if the reserve is not frozen or paused
        expect(reserve.isFrozen).toBe(false);
        expect(reserve.isPaused).toBe(false);
        expect(reserve.userState?.balance.amount.value).toBeBigDecimalCloseTo(
          bigDecimal(0.2),
        );
        annotate(`user address: ${evmAddress(wallet.account!.address)}`);
        const resultSupply = await supply(client, {
          market: reserve.market.address,
          chainId: reserve.market.chain.chainId,
          sender: evmAddress(wallet.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: amountToSupply,
            },
          },
        })
          .andThen(sendWith(wallet))
          .andThen(client.waitForTransaction);
        assertOk(resultSupply);
        const reserveAfterSupply = await fetchReserve(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(wallet.account!.address),
        );
        expect(
          reserveAfterSupply?.userState?.balance.amount.value,
        ).toBeBigDecimalCloseTo(bigDecimal(Number(amountToSupply)));
        const resultWithdraw = await withdraw(client, {
          market: reserve.market.address,
          sender: evmAddress(wallet.account!.address),
          amount: {
            erc20: {
              currency: ETHEREUM_WETH_ADDRESS,
              value: { exact: bigDecimal(Number(amountToSupply) * 0.5) },
            },
          },
          chainId: reserve.market.chain.chainId,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => annotate(`tx to withdraw: ${tx.txHash}`))
          .andThen(client.waitForTransaction);

        assertOk(resultWithdraw);
        const reserveAfterWithdraw = await fetchReserve(
          ETHEREUM_WETH_ADDRESS,
          evmAddress(wallet.account!.address),
        );
        expect(
          reserveAfterWithdraw?.userState?.balance.amount.value,
        ).toBeBigDecimalCloseTo(bigDecimal(Number(amountToSupply) * 1.5));
      }, 50_000);
    });
  });
});
