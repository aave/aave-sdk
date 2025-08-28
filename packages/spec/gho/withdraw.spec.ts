import { assertOk, bigDecimal, evmAddress } from '@aave/client';
import {
  savingsGhoBalance,
  savingsGhoDeposit,
  savingsGhoWithdraw,
} from '@aave/client/actions';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_GHO_ADDRESS,
  fundErc20Address,
  getBalance,
} from '@aave/client/test-utils';
import { sendWith } from '@aave/client/viem';
import { beforeAll, describe, expect, it } from 'vitest';

// TODO: needs to be added cooldown call to the backend to be able to withdraw
describe.skip('Given Savings GHO', () => {
  describe('And a user with sGHO balance', () => {
    describe('When the user withdraws part of their sGHO for GHO', () => {
      const user = createNewWallet();
      const amountToSupply = 100;

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_GHO_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal(amountToSupply),
        ).andThen(() =>
          savingsGhoDeposit(client, {
            depositor: evmAddress(user.account!.address),
            amount: {
              value: bigDecimal(amountToSupply),
            },
            chainId: ETHEREUM_FORK_ID,
          }),
        );
        assertOk(setup);
      });

      it("Then it should be reflected in the user's savings GHO balance", async ({
        annotate,
      }) => {
        annotate(`wallet address: ${user.account!.address}`);
        const amountToWithdraw = 40;

        const savingsGhoWithdrawResult = await savingsGhoWithdraw(client, {
          amount: {
            exact: bigDecimal(amountToWithdraw),
          },
          sharesOwner: evmAddress(user.account!.address),
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx to withdraw sGHO: ${tx.txHash}`))
          .andThen(() =>
            savingsGhoBalance(client, {
              user: evmAddress(user.account!.address),
              chainId: ETHEREUM_FORK_ID,
            }),
          );
        assertOk(savingsGhoWithdrawResult);
        expect(savingsGhoWithdrawResult.value.amount.value).toBe(
          bigDecimal(amountToSupply - amountToWithdraw),
        );
        const balanceGho = await getBalance(
          evmAddress(user.account!.address),
          ETHEREUM_GHO_ADDRESS,
        );
        expect(balanceGho).toBe(amountToWithdraw);
      });
    });

    describe('When the user withdraws all of their sGHO for GHO', () => {
      const user = createNewWallet();
      const amountToSupply = 100;

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_GHO_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal(amountToSupply),
        ).andThen(() =>
          savingsGhoDeposit(client, {
            depositor: evmAddress(user.account!.address),
            amount: {
              value: bigDecimal(amountToSupply),
            },
            chainId: ETHEREUM_FORK_ID,
          }),
        );
        assertOk(setup);
      });

      it("Then user's savings GHO balance should be 0", async ({
        annotate,
      }) => {
        annotate(`wallet address: ${user.account!.address}`);
        const savingsGhoWithdrawResult = await savingsGhoWithdraw(client, {
          amount: {
            max: true,
          },
          sharesOwner: evmAddress(user.account!.address),
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx to withdraw all sGHO: ${tx.txHash}`))
          .andThen(client.waitForTransaction)
          .andThen(() =>
            savingsGhoBalance(client, {
              user: evmAddress(user.account!.address),
              chainId: ETHEREUM_FORK_ID,
            }),
          );
        assertOk(savingsGhoWithdrawResult);
        expect(savingsGhoWithdrawResult.value.amount.value).toBe(bigDecimal(0));

        const balanceGho = await getBalance(
          evmAddress(user.account!.address),
          ETHEREUM_GHO_ADDRESS,
        );
        expect(balanceGho).toBe(amountToSupply);
      });
    });

    describe('When the user withdraws sGHO for GHO specifying another address', () => {
      const user = createNewWallet();
      const anotherUser = createNewWallet();
      const amountToSupply = 100;

      beforeAll(async () => {
        const setup = await fundErc20Address(
          ETHEREUM_GHO_ADDRESS,
          evmAddress(user.account!.address),
          bigDecimal(amountToSupply),
        ).andThen(() =>
          savingsGhoDeposit(client, {
            depositor: evmAddress(user.account!.address),
            amount: {
              value: bigDecimal(amountToSupply),
            },
            chainId: ETHEREUM_FORK_ID,
          }),
        );
        assertOk(setup);
      });

      it("Then it should be reflected in the other user's savings GHO balance", async ({
        annotate,
      }) => {
        annotate(`user address: ${user.account!.address}`);
        annotate(`another user address: ${anotherUser.account!.address}`);
        const amountToWithdraw = 40;

        const savingsGhoWithdrawResult = await savingsGhoWithdraw(client, {
          amount: {
            exact: bigDecimal(amountToWithdraw),
          },
          sharesOwner: evmAddress(user.account!.address),
          recipient: evmAddress(anotherUser.account!.address),
          chainId: ETHEREUM_FORK_ID,
        })
          .andThen(sendWith(user))
          .andTee((tx) => annotate(`tx to withdraw sGHO: ${tx.txHash}`))
          .andThen(() =>
            savingsGhoBalance(client, {
              user: evmAddress(user.account!.address),
              chainId: ETHEREUM_FORK_ID,
            }),
          );
        assertOk(savingsGhoWithdrawResult);
        expect(savingsGhoWithdrawResult.value.amount.value).toBe(
          bigDecimal(amountToSupply - amountToWithdraw),
        );

        const balanceGho = await getBalance(
          evmAddress(anotherUser.account!.address),
          ETHEREUM_GHO_ADDRESS,
        );
        expect(balanceGho).toBe(amountToWithdraw);
      });
    });
  });
});
