import { assertOk, bigDecimal, evmAddress } from '@aave/client';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_GHO_ADDRESS,
  fundErc20Address,
} from '../test-utils';
import { sendWith } from '../viem';
import { savingsGhoBalance, savingsGhoDeposit } from './gho';

describe('Given Savings GHO', () => {
  describe('And a user with GHO balance', () => {
    const wallet = createNewWallet();

    describe('When the user wants to deposit GHO for sGHO', () => {
      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_GHO_ADDRESS,
          evmAddress(wallet.account!.address),
          bigDecimal('100'),
        );
        assertOk(setup);
      });

      it('Then the user should have sGHO balance', async ({ annotate }) => {
        annotate(`wallet address: ${wallet.account!.address}`);
        const savingsGhoDepositResult = await savingsGhoDeposit(client, {
          amount: {
            value: bigDecimal('90'),
          },
          depositor: evmAddress(wallet.account!.address),
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => annotate(`tx to deposit GHO: ${tx.txHash}`))
          .andThen(client.waitForTransaction);
        assertOk(savingsGhoDepositResult);

        const savingsGhoBalanceResult = await savingsGhoBalance(client, {
          user: evmAddress(wallet.account!.address),
        });
        assertOk(savingsGhoBalanceResult);
        expect(savingsGhoBalanceResult.value.amount.value).toBe(
          bigDecimal('90'),
        );
      });
    });
  });
});
