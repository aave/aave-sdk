import { assertOk, bigDecimal, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  fetchReserve,
  fundErc20Address,
  WETH_ADDRESS,
  wait,
} from '../test-utils';
import { sendWith } from '../viem';
import { vaultDeploy } from './transactions';
import { vaults } from './vaults';

describe('Given the Aave Protocol v3', () => {
  describe('When user deploys a vault for wETH on default market', () => {
    const wallet = createNewWallet();

    beforeAll(async () => {
      await fundErc20Address(
        WETH_ADDRESS,
        evmAddress(wallet.account!.address),
        bigDecimal('1'),
      );
    });

    it('Then vault is created', async () => {
      const reserve = await fetchReserve(WETH_ADDRESS);
      const result = await vaultDeploy(client, {
        chainId: reserve.market.chain.chainId,
        market: reserve.market.address,
        deployer: evmAddress(wallet.account!.address),
        owner: evmAddress(wallet.account!.address),
        initialFee: bigDecimal('3'),
        initialLockDeposit: bigDecimal('1'),
        shareName: 'Aave WETH Vault Shares',
        shareSymbol: 'avWETH',
        underlyingToken: reserve.underlyingToken.address,
      })
        .andThen(sendWith(wallet))
        .andTee((tx) => console.log(`transaction: ${tx}`));
      assertOk(result);
      await wait(1000); //TODO: improve the wait time
      const vaultInfo = await vaults(client, {
        criteria: {
          ownedBy: [evmAddress(wallet.account!.address)],
        },
      });
      assertOk(vaultInfo);
      expect(vaultInfo.value.items.length).toBe(1);
      console.log(`Vault with address ${vaultInfo.value.items[0]?.address}`);
      expect(vaultInfo.value.items[0]?.owner).toEqual(wallet.account!.address);
    }, 25_000);
  });
});
