import type { Vault } from '@aave/graphql';
import { assertOk, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  bigDecimal,
  client,
  createNewWallet,
  fetchReserve,
  fundErc20Address,
  WETH_ADDRESS,
  wait,
} from '../test-utils';
import { sendWith } from '../viem';
import { vaultDeploy, vaultDeposit } from './transactions';
import { userVaults, vault } from './vaults';

async function createVault(): Promise<Vault> {
  const tempWallet = createNewWallet();

  await fundErc20Address(
    WETH_ADDRESS,
    evmAddress(tempWallet.account!.address),
    bigDecimal('2'),
  );

  const reserve = await fetchReserve(WETH_ADDRESS);
  const result = await vaultDeploy(client, {
    chainId: reserve.market.chain.chainId,
    market: reserve.market.address,
    deployer: evmAddress(tempWallet.account!.address),
    owner: evmAddress(tempWallet.account!.address),
    initialFee: bigDecimal('3'),
    initialLockDeposit: bigDecimal('1'),
    shareName: 'Aave WETH Vault Shares',
    shareSymbol: 'avWETH',
    underlyingToken: reserve.underlyingToken.address,
  })
    .andThen(sendWith(tempWallet))
    .andTee((tx) => console.log(`transaction: ${tx}`))
    .andTee(() => wait(2000))
    .andThen((tx) =>
      vault(client, {
        by: { txHash: tx },
        chainId: reserve.market.chain.chainId,
      }),
    );
  assertOk(result);
  console.log(`Vault with address ${result.value?.address}`);
  return result.value!;
}

describe('Given the Aave v3 Vaults', () => {
  describe('When a user deposits into an existing vault', () => {
    const wallet = createNewWallet();
    let vaultInfo: Vault;

    beforeAll(async () => {
      await fundErc20Address(
        WETH_ADDRESS,
        evmAddress(wallet.account!.address),
        bigDecimal('2'),
      );

      vaultInfo = await createVault();
    });

    it("Then it should be available in the user's vault positions", async () => {
      const vaults = await vaultDeposit(client, {
        amount: {
          value: bigDecimal('1'),
          currency: WETH_ADDRESS,
        },
        vault: vaultInfo.address,
        depositor: evmAddress(wallet.account!.address),
        chainId: vaultInfo.chainId,
      })
        .andThen(sendWith(wallet))
        .andTee((tx) => console.log(`tx to deposit in vault: ${tx}`))
        .andTee(() => wait(1000))
        .andThen(() =>
          userVaults(client, {
            user: evmAddress(wallet.account!.address),
          }),
        );
      assertOk(vaults);
      expect(vaults.value.items.length).toBe(1);
    });
  });
});
