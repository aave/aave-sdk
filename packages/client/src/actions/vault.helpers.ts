import type { Vault } from '@aave/graphql';
import type { ResultAsync } from '@aave/types';
import { evmAddress, nonNullable, okAsync } from '@aave/types';
import type { WalletClient } from 'viem';
import {
  bigDecimal,
  client,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fundErc20Address,
} from '../test-utils';
import type { Annotate } from '../types';
import { sendWith } from '../viem';
import { reserve } from './reserve';
import { vaultDeploy, vaultDeposit, vaultMintShares } from './transactions';
import { vault } from './vaults';

export function createVault(
  organization: WalletClient,
  annotate?: Annotate,
  config?: {
    initialFee?: number;
    token?: {
      name: string;
      symbol: string;
      address: string;
    };
  },
): ResultAsync<Vault, Error> {
  return fundErc20Address(
    evmAddress(config?.token?.address ?? ETHEREUM_WETH_ADDRESS),
    evmAddress(organization.account!.address),
    bigDecimal('2'),
  ).andThen(() => {
    return reserve(client, {
      chainId: ETHEREUM_FORK_ID,
      underlyingToken: config?.token?.address ?? ETHEREUM_WETH_ADDRESS,
      market: ETHEREUM_MARKET_ADDRESS,
    }).andThen((reserve) => {
      return vaultDeploy(client, {
        chainId: reserve!.market.chain.chainId,
        market: reserve!.market.address,
        deployer: evmAddress(organization.account!.address),
        owner: evmAddress(organization.account!.address),
        initialFee: bigDecimal(config?.initialFee ?? '3'),
        initialLockDeposit: bigDecimal('1'),
        shareName: config?.token?.name ?? 'Aave WETH Vault Shares',
        shareSymbol: config?.token?.symbol ?? 'avWETH',
        underlyingToken: reserve!.underlyingToken.address,
      })
        .andThen(sendWith(organization))
        .andTee((tx) => annotate?.(`tx to deploy vault: ${tx.txHash}`))
        .andThen(client.waitForTransaction)
        .andThen((txHash) =>
          vault(client, { by: { txHash }, chainId: ETHEREUM_FORK_ID }),
        )
        .andTee((vault) => annotate?.(`vault address: ${vault?.address}`))
        .map(nonNullable);
    });
  });
}

export function deposit(user: WalletClient, amount: number) {
  return (vault: Vault): ResultAsync<Vault, Error> => {
    return fundErc20Address(
      ETHEREUM_WETH_ADDRESS,
      evmAddress(user.account!.address),
      bigDecimal(amount + 0.1),
    ).andThen(() => {
      return vaultDeposit(client, {
        amount: {
          value: bigDecimal('1'),
          currency: ETHEREUM_WETH_ADDRESS,
        },
        vault: vault.address,
        depositor: evmAddress(user.account!.address),
        chainId: vault.chainId,
      })
        .andThen(sendWith(user))
        .andTee((tx) => console.log(`tx to deposit in vault: ${tx.txHash}`))
        .andThen(client.waitForTransaction)
        .andThen(() => okAsync(vault));
    });
  };
}

export function mintShares(
  user: WalletClient,
  amount: number,
  annotate?: Annotate,
  tokenAddress?: string,
) {
  return (vault: Vault): ResultAsync<Vault, Error> => {
    return fundErc20Address(
      evmAddress(tokenAddress ?? ETHEREUM_WETH_ADDRESS),
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
        .andTee((tx) => annotate?.(`tx to mint shares: ${tx.txHash}`))
        .andThen(client.waitForTransaction)
        .andThen(() => okAsync(vault));
    });
  };
}
