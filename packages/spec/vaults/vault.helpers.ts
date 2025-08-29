import {
  type BigDecimal,
  type EvmAddress,
  evmAddress,
  nonNullable,
  okAsync,
  type ResultAsync,
} from '@aave/client';
import {
  reserve,
  vault,
  vaultDeploy,
  vaultDeposit,
  vaultMintShares,
} from '@aave/client/actions';
import {
  bigDecimal,
  client,
  ETHEREUM_FORK_ID,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_WETH_ADDRESS,
  fundErc20Address,
} from '@aave/client/test-utils';
import { sendWith } from '@aave/client/viem';
import type { Vault } from '@aave/graphql';
import type { WalletClient } from 'viem';

export function createVault(
  organization: WalletClient,
  config?: {
    initialFee?: number;
    token?: {
      name: string;
      symbol: string;
      address: EvmAddress;
    };
    recipients?: {
      address: EvmAddress;
      percent: BigDecimal;
    }[];
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
        initialLockDeposit: bigDecimal('0.05'),
        shareName: config?.token?.name ?? 'Aave WETH Vault Shares',
        shareSymbol: config?.token?.symbol ?? 'avWETH',
        underlyingToken: reserve!.underlyingToken.address,
        recipients: config?.recipients,
      })
        .andThen(sendWith(organization))
        .andThen(client.waitForTransaction)
        .andThen((txHash) =>
          vault(client, { by: { txHash }, chainId: ETHEREUM_FORK_ID }),
        )
        .map(nonNullable);
    });
  });
}

export function depositOntoVault(user: WalletClient, amount: number) {
  return (vault: Vault): ResultAsync<Vault, Error> => {
    return fundErc20Address(
      ETHEREUM_WETH_ADDRESS,
      evmAddress(user.account!.address),
      bigDecimal(amount + 0.1),
    ).andThen(() => {
      return vaultDeposit(client, {
        amount: {
          value: bigDecimal(amount),
        },
        vault: vault.address,
        depositor: evmAddress(user.account!.address),
        chainId: vault.chainId,
      })
        .andThen(sendWith(user))
        .andThen(client.waitForTransaction)
        .andThen(() => okAsync(vault));
    });
  };
}

export function mintSharesFromVault(
  user: WalletClient,
  amount: number,
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
        .andThen(client.waitForTransaction)
        .andThen(() => okAsync(vault));
    });
  };
}
