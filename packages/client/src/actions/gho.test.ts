import { assertOk, bigDecimal, evmAddress } from '@aave/client';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_GHO_ADDRESS,
  fundErc20Address,
} from '../test-utils';
import { sendWith } from '../viem';
import {
  savingsGhoBalance,
  savingsGhoDeposit,
  savingsGhoWithdraw,
} from './gho';

describe('Given Savings GHO', () => {
  describe('And a user with GHO balance', () => {
    const wallet = createNewWallet();

    describe('When the user wants to deposit GHO for sGHO', () => {
      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_GHO_ADDRESS,
          evmAddress(wallet.account!.address),
          bigDecimal('105'),
        );
        assertOk(setup);
      });

      it('Then the user should have sGHO balance', async ({ annotate }) => {
        annotate(`wallet address: ${wallet.account!.address}`);
        const beforeDeposit = await savingsGhoBalance(client, {
          user: evmAddress(wallet.account!.address),
          chainId: ETHEREUM_FORK_ID,
        });
        assertOk(beforeDeposit);

        const savingsGhoDepositResult = await savingsGhoDeposit(client, {
          amount: {
            value: bigDecimal('90'),
          },
          depositor: evmAddress(wallet.account!.address),
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => console.log(`tx to deposit GHO: ${tx.txHash}`));

        assertOk(savingsGhoDepositResult);

        const savingsGhoBalanceResult = await savingsGhoBalance(client, {
          user: evmAddress(wallet.account!.address),
          chainId: ETHEREUM_FORK_ID,
        });
        assertOk(savingsGhoBalanceResult);
        expect(savingsGhoBalanceResult.value.amount.value).toBe(
          bigDecimal('90'),
        );

        const savingsGhoWithdrawResult = await savingsGhoWithdraw(client, {
          amount: {
            exact: bigDecimal('40'),
          },
          sharesOwner: evmAddress(wallet.account!.address),
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(wallet))
          .andTee((tx) => console.log(`tx to withdraw sGHO: ${tx.txHash}`));

        assertOk(savingsGhoWithdrawResult);

        const savingsGhoBalanceResult2 = await savingsGhoBalance(client, {
          user: evmAddress(wallet.account!.address),
          chainId: ETHEREUM_FORK_ID,
        });
        assertOk(savingsGhoBalanceResult2);
        expect(savingsGhoBalanceResult2.value.amount.value).toBe(
          bigDecimal('50'),
        );
      });
    });
  });
});
