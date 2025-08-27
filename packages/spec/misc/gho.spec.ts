import { assertOk, bigDecimal, evmAddress } from '@aave/client';
import {
  permitTypedData,
  savingsGhoBalance,
  savingsGhoDeposit,
} from '@aave/client/actions';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_GHO_ADDRESS,
  ETHEREUM_SGHO_ADDRESS,
  fundErc20Address,
} from '@aave/client/test-utils';
import { sendWith, signERC20PermitWith } from '@aave/client/viem';
import { beforeAll, describe, expect, it } from 'vitest';

describe('Given Savings GHO', () => {
  describe('When a user wants to deposit GHO for sGHO', () => {
    const user = createNewWallet();
    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_GHO_ADDRESS,
        evmAddress(user.account!.address),
        bigDecimal('105'),
      );
      assertOk(setup);
    });

    it("Then it should be reflected in the user's savings GHO balance", async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
      const savingsGhoDepositResult = await savingsGhoDeposit(client, {
        amount: {
          value: bigDecimal('90'),
        },
        depositor: evmAddress(user.account!.address),
        chainId: ETHEREUM_FORK_ID,
      })
        .andThen(sendWith(user))
        .andTee((tx) => annotate(`tx to deposit GHO: ${tx.txHash}`))
        .andThen(() =>
          savingsGhoBalance(client, {
            user: evmAddress(user.account!.address),
            chainId: ETHEREUM_FORK_ID,
          }),
        );
      assertOk(savingsGhoDepositResult);
      expect(savingsGhoDepositResult.value.amount.value).toBe(bigDecimal('90'));
    });
  });

  describe('When a user wants to deposit GHO for sGHO in behalf of another user', () => {
    const user = createNewWallet();
    const another = createNewWallet();

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_GHO_ADDRESS,
        evmAddress(user.account!.address),
        bigDecimal('105'),
      );
      assertOk(setup);
    });
    it("Then it should be reflected in the other user's savings GHO balance", async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
      annotate(`another user address: ${another.account!.address}`);

      const savingsGhoDepositResult = await savingsGhoDeposit(client, {
        amount: {
          value: bigDecimal('90'),
        },
        depositor: evmAddress(user.account!.address),
        recipient: evmAddress(another.account!.address),
        chainId: ETHEREUM_FORK_ID,
      })
        .andThen(sendWith(user))
        .andTee((tx) =>
          annotate(`tx to deposit GHO in behalf of another user: ${tx.txHash}`),
        )
        .andThen(() =>
          savingsGhoBalance(client, {
            user: evmAddress(another.account!.address),
            chainId: ETHEREUM_FORK_ID,
          }),
        );
      assertOk(savingsGhoDepositResult);
      expect(savingsGhoDepositResult.value.amount.value).toBe(bigDecimal('90'));

      const userSGHOBalance = await savingsGhoBalance(client, {
        user: evmAddress(user.account!.address),
        chainId: ETHEREUM_FORK_ID,
      });
      assertOk(userSGHOBalance);
      expect(userSGHOBalance.value.amount.value).toBe(bigDecimal('0'));
    });
  });

  describe('When a user wants to deposit GHO for sGHO with a permit signature', () => {
    const user = createNewWallet();
    const amountToSupply = '100';

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_GHO_ADDRESS,
        evmAddress(user.account!.address),
        bigDecimal('105'),
      );
      assertOk(setup);
    });

    it("Then it should be reflected in the user's savings GHO balance without needing for an ERC20 Approval transaction", async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
      const signature = await permitTypedData(client, {
        currency: ETHEREUM_GHO_ADDRESS,
        amount: amountToSupply,
        chainId: ETHEREUM_FORK_ID,
        spender: ETHEREUM_SGHO_ADDRESS,
        owner: evmAddress(user.account!.address),
      }).andThen(signERC20PermitWith(user));
      assertOk(signature);

      const result = await savingsGhoDeposit(client, {
        amount: {
          value: amountToSupply,
          permitSig: signature.value,
        },
        depositor: evmAddress(user.account!.address),
        chainId: ETHEREUM_FORK_ID,
      })
        .andTee((tx) => expect(tx.__typename).toEqual('TransactionRequest'))
        .andThen(sendWith(user))
        .andThen(() =>
          savingsGhoBalance(client, {
            user: evmAddress(user.account!.address),
            chainId: ETHEREUM_FORK_ID,
          }),
        );
      assertOk(result);
      expect(result.value.amount.value).toBe(bigDecimal(amountToSupply));
    });
  });

  describe('When a user wants to deposit GHO for sGHO in behalf of another user with a permit signature', () => {
    const user = createNewWallet();
    const anotherUser = createNewWallet();
    const amountToSupply = '100';

    beforeAll(async () => {
      const setup = await fundErc20Address(
        ETHEREUM_GHO_ADDRESS,
        evmAddress(user.account!.address),
        bigDecimal('105'),
      );
      assertOk(setup);
    });

    it("Then it should be reflected in the other user's savings GHO balance without needing for an ERC20 Approval transaction", async ({
      annotate,
    }) => {
      annotate(`user address: ${user.account!.address}`);
      annotate(`another user address: ${anotherUser.account!.address}`);

      const signature = await permitTypedData(client, {
        currency: ETHEREUM_GHO_ADDRESS,
        amount: amountToSupply,
        chainId: ETHEREUM_FORK_ID,
        spender: ETHEREUM_SGHO_ADDRESS,
        owner: evmAddress(user.account!.address),
      }).andThen(signERC20PermitWith(user));
      assertOk(signature);

      const result = await savingsGhoDeposit(client, {
        amount: {
          value: amountToSupply,
          permitSig: signature.value,
        },
        depositor: evmAddress(user.account!.address),
        recipient: evmAddress(anotherUser.account!.address),
        chainId: ETHEREUM_FORK_ID,
      })
        .andTee((tx) => expect(tx.__typename).toEqual('TransactionRequest'))
        .andThen(sendWith(user))
        .andThen(() =>
          savingsGhoBalance(client, {
            user: evmAddress(anotherUser.account!.address),
            chainId: ETHEREUM_FORK_ID,
          }),
        );
      assertOk(result);
      expect(result.value.amount.value).toBe(bigDecimal(amountToSupply));
    });
  });
});
