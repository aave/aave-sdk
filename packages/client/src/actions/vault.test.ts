import { OrderDirection } from '@aave/graphql';
import { assertOk, evmAddress } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  client,
  createNewWallet,
  DAI_ADDRESS,
  USDC_ADDRESS,
  WETH_ADDRESS,
  wait,
} from '../test-utils';
import { createVault, mintShares } from './vault.helpers';
import { userVaults } from './vaults';

const organization = createNewWallet();
const wallet = createNewWallet();

describe('Given the Aave Vaults', () => {
  describe('When a user lists all the vaults they have a position in', () => {
    beforeAll(async () => {
      const vault1 = await createVault(organization, {
        initialFee: 2.0,
        token: {
          name: 'Aave WETH Vault Shares',
          symbol: 'avWETH',
          address: WETH_ADDRESS,
        },
      }).andThen(mintShares(wallet, 10));
      assertOk(vault1);

      const vault2 = await createVault(organization, {
        initialFee: 5.0,
        token: {
          name: 'Aave USDC Vault Shares',
          symbol: 'avUSDC',
          address: USDC_ADDRESS,
        },
      }).andThen(mintShares(wallet, 5, USDC_ADDRESS));
      assertOk(vault2);

      await wait(5000);
    }, 60_000);

    it('Then it should be possible so sort them by the amount of shares they have', async () => {
      const listOfVaultsDesc = await userVaults(client, {
        user: evmAddress(wallet.account!.address),
        orderBy: { shares: OrderDirection.Desc },
      });

      assertOk(listOfVaultsDesc);
      expect(
        Number(
          listOfVaultsDesc.value.items[0]?.userShares?.shares.amount.value,
        ),
      ).toBeGreaterThanOrEqual(
        Number(
          listOfVaultsDesc.value.items[1]?.userShares?.shares.amount.value,
        ),
      );

      const listOfVaultsAsc = await userVaults(client, {
        user: evmAddress(wallet.account!.address),
        orderBy: { shares: OrderDirection.Asc },
      });

      assertOk(listOfVaultsAsc);
      expect(
        Number(listOfVaultsAsc.value.items[0]?.userShares?.shares.amount.value),
      ).toBeLessThanOrEqual(
        Number(listOfVaultsAsc.value.items[1]?.userShares?.shares.amount.value),
      );
    });

    it(`Then it should be possible so sort them by Vault's fee`, async () => {
      const listOfVaultsDesc = await userVaults(client, {
        user: evmAddress(wallet.account!.address),
        orderBy: { fee: OrderDirection.Desc },
      });

      assertOk(listOfVaultsDesc);
      expect(
        Number(listOfVaultsDesc.value.items[0]?.fee.value),
      ).toBeGreaterThanOrEqual(
        Number(listOfVaultsDesc.value.items[1]?.fee.value),
      );

      const listOfVaultsAsc = await userVaults(client, {
        user: evmAddress(wallet.account!.address),
        orderBy: { fee: OrderDirection.Asc },
      });

      assertOk(listOfVaultsAsc);
      expect(
        Number(listOfVaultsAsc.value.items[0]?.fee.value),
      ).toBeLessThanOrEqual(Number(listOfVaultsAsc.value.items[1]?.fee.value));
    });

    it('Then it should be possible so filter them by underlying tokens', async () => {
      const listOfVaults = await userVaults(client, {
        user: evmAddress(wallet.account!.address),
        filters: {
          underlyingTokens: [WETH_ADDRESS],
        },
      });

      assertOk(listOfVaults);
      expect(listOfVaults.value.items).toEqual([
        expect.objectContaining({
          usedReserve: expect.objectContaining({
            underlyingToken: expect.objectContaining({
              address: WETH_ADDRESS,
            }),
          }),
        }),
      ]);
    });
  });
});
