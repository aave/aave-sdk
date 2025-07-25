import type { Vault } from '@aave/graphql';
import {
  assertOk,
  bigDecimal,
  evmAddress,
  nonNullable,
  okAsync,
  type ResultAsync,
} from '@aave/types';
import { describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  fundErc20Address,
  getBalance,
  WETH_ADDRESS,
  wait,
} from '../test-utils';
import { sendWith } from '../viem';
import { reserve } from './reserve';
import {
  vaultDeploy,
  vaultDeposit,
  vaultMintShares,
  vaultRedeemShares,
  vaultWithdraw,
} from './transactions';
import { userVaults, vault, vaults } from './vaults';

const organization = createNewWallet();
const user = createNewWallet();

function createVault(): ResultAsync<Vault, Error> {
  return fundErc20Address(
    WETH_ADDRESS,
    evmAddress(organization.account!.address),
    bigDecimal('2'),
  ).andThen(() => {
    return reserve(client, {
      chainId: ETHEREUM_FORK_ID,
      underlyingToken: WETH_ADDRESS,
      market: ETHEREUM_MARKET_ADDRESS,
    }).andThen((reserve) => {
      return vaultDeploy(client, {
        chainId: reserve!.market.chain.chainId,
        market: reserve!.market.address,
        deployer: evmAddress(organization.account!.address),
        owner: evmAddress(organization.account!.address),
        initialFee: bigDecimal('3'),
        initialLockDeposit: bigDecimal('1'),
        shareName: 'Aave WETH Vault Shares',
        shareSymbol: 'avWETH',
        underlyingToken: reserve!.underlyingToken.address,
      })
        .andThen(sendWith(organization))
        .andThen((txHash) =>
          vault(client, { by: { txHash }, chainId: ETHEREUM_FORK_ID }),
        )
        .andTee((vault) => console.log(`vault address: ${vault?.address}`))
        .map(nonNullable);
    });
  });
}

function deposit(amount: number) {
  return (vault: Vault): ResultAsync<Vault, Error> => {
    return fundErc20Address(
      WETH_ADDRESS,
      evmAddress(user.account!.address),
      bigDecimal(amount + 0.1),
    ).andThen(() => {
      return vaultDeposit(client, {
        amount: {
          value: bigDecimal('1'),
          currency: WETH_ADDRESS,
        },
        vault: vault.address,
        depositor: evmAddress(user.account!.address),
        chainId: vault.chainId,
      })
        .andThen(sendWith(user))
        .andTee((txHash) => console.log(`tx to deposit in vault: ${txHash}`))
        .andThen(() => okAsync(vault));
    });
  };
}

function mintShares(amount: number) {
  return (vault: Vault): ResultAsync<Vault, Error> => {
    return fundErc20Address(
      WETH_ADDRESS,
      evmAddress(user.account!.address),
      bigDecimal(amount + 0.1),
    ).andThen(() => {
      return vaultMintShares(client, {
        shares: {
          amount: bigDecimal(amount),
        },
        vault: vault.address,
        minter: evmAddress(user.account!.address),
        chainId: vault.chainId,
      })
        .andThen(sendWith(user))
        .andTee((tx) => console.log(`tx to mint shares: ${tx}`))
        .andThen(() => okAsync(vault));
    });
  };
}

describe('Given the Aave Vaults', () => {
  describe('When an organization deploys a new vault', () => {
    it('Then it should be available in the organization vaults', async () => {
      const initialVault = await createVault();
      assertOk(initialVault);

      const result = await vaults(client, {
        criteria: {
          ownedBy: [evmAddress(organization.account!.address)],
        },
      });

      assertOk(result);
      expect(result.value.items[0]?.owner).toEqual(
        organization.account!.address,
      );
      expect(result.value.items[0]?.address).toEqual(
        initialVault.value?.address,
      );
    });
  });

  describe('And a deployed organization vault', () => {
    describe('When a user deposits into the vault', () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault()
          .andThen(deposit(1))
          .andTee(() => wait(2000)); // wait for the deposit to be processed
        assertOk(initialVault);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });

        assertOk(userPositions);
        expect(userPositions.value.items.length).toBe(1);
        expect(
          userPositions.value.items[0]?.balance.amount.value,
        ).toBeBigDecimalCloseTo(1, 2);
      });
    });

    describe(`When the user mints some vault's shares`, () => {
      it(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault()
          .andThen(mintShares(1))
          .andTee(() => wait(2000)); // wait for the mint to be processed
        assertOk(initialVault);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        expect(
          userPositions.value.items[0]?.userShares?.shares.amount.value,
        ).toBeBigDecimalCloseTo(1, 4);
      });
    });

    describe('When the user withdraws their assets from the vault', () => {
      it.skip(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault()
          .andThen(deposit(1))
          .andTee(() => wait(2000)); // wait for the deposit to be processed
        assertOk(initialVault);

        const balanceBefore = await getBalance(
          evmAddress(user.account!.address),
          WETH_ADDRESS,
        );
        const withdrawResult = await vaultWithdraw(client, {
          chainId: initialVault.value?.chainId,
          sharesOwner: evmAddress(user.account!.address),
          underlyingToken: {
            asAToken: false,
            amount: bigDecimal('0.5'),
          },
          vault: initialVault.value?.address,
        })
          .andTee((result) =>
            console.log(`result: ${JSON.stringify(result, null, 2)}`),
          )
          .andThen(sendWith(user))
          .andTee((tx) => console.log(`tx to withdraw from vault: ${tx}`))
          .andTee(() => wait(2000)); // wait for the withdraw to be processed
        assertOk(withdrawResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        const balanceAfter = await getBalance(
          evmAddress(user.account!.address),
          WETH_ADDRESS,
        );
        expect(balanceAfter).toBeGreaterThan(balanceBefore);
        expect(
          userPositions.value.items[0]?.balance.amount.value,
        ).toBeBigDecimalCloseTo(0, 2);

        // TODO: check balance in the wallet after withdraw
      });
    });

    describe('When the user redeems their shares', () => {
      it.skip(`Then the operation should be reflected in the user's vault positions`, async () => {
        const initialVault = await createVault()
          .andThen(mintShares(1))
          .andTee(() => wait(2000)); // wait for the mint to be processed
        assertOk(initialVault);

        const redeemResult = await vaultRedeemShares(client, {
          shares: {
            amount: bigDecimal('1'),
          },
          vault: initialVault.value!.address,
          chainId: initialVault.value!.chainId,
          sharesOwner: evmAddress(user.account!.address),
        })
          .andThen(sendWith(user))
          .andTee((tx) => console.log(`tx to redeem shares: ${tx}`))
          .andTee(() => wait(2000)); // wait for the redeem to be processed
        assertOk(redeemResult);

        const userPositions = await userVaults(client, {
          user: evmAddress(user.account!.address),
        });
        assertOk(userPositions);
        expect(
          userPositions.value.items[0]?.userShares?.shares.amount.value,
        ).toBeBigDecimalCloseTo(0, 4);
      });
    });

    describe(`When the organization changes the vault's fee`, () => {
      it.todo(
        'Then the new fee should be reflected in the vault object',
        async () => {
          // assert vault.fee
        },
      );
    });

    describe('When users borrow from the underlying vault reserve', () => {
      // const borrower = createNewWallet();

      it.todo('Then the vault should accrue its fees', () => {
        // const setup = createVault().andThen(deposit(100));
        // assertOk(result);
        // assert vault.totalFeeRevenue
      });
    });

    describe(`When the organization withdraws the vault's fees`, () => {
      // const borrower = createNewWallet();

      it.todo(
        'Then they shoudl receive the expected ERC-20 amount',
        async () => {},
      );
    });
  });
});
