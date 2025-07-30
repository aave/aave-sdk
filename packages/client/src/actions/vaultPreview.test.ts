import type { Vault } from '@aave/graphql';
import { assertOk, bigDecimal } from '@aave/types';
import { beforeAll, describe, expect, it } from 'vitest';
import { client, createNewWallet } from '../test-utils';
import { createVault } from './vault.helpers';
import {
  vaultPreviewDeposit,
  vaultPreviewMint,
  vaultPreviewRedeem,
  vaultPreviewWithdraw,
} from './vaults';

describe('Given the Aave Vaults', () => {
  describe('And a deployed organization vault', () => {
    const organization = createNewWallet();
    let initialVault: Vault;

    beforeAll(async () => {
      const result = await createVault(organization);
      assertOk(result);
      initialVault = result.value;
    });

    describe('When a user previews a deposit into the vault', () => {
      it('Then it should return the expected amount of shares', async () => {
        const previewDepositResult = await vaultPreviewDeposit(client, {
          vault: initialVault.address,
          amount: bigDecimal('1'),
          chainId: initialVault.chainId,
        });
        assertOk(previewDepositResult);
        expect(previewDepositResult.value).toEqual(
          expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeBigDecimalCloseTo(1, 4),
            }),
          }),
        );
      });
    });

    describe('When a user previews a minting shares from a vault', () => {
      it('Then it should return the expected amount of tokens needed to mint', async () => {
        const previewMintResult = await vaultPreviewMint(client, {
          vault: initialVault.address,
          amount: bigDecimal('1'),
          chainId: initialVault.chainId,
        });
        assertOk(previewMintResult);
        expect(previewMintResult.value).toEqual(
          expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeBigDecimalCloseTo(1, 4),
            }),
          }),
        );
      });
    });

    describe('When a user previews a withdrawal assets from a vault', () => {
      it('Then it should return the expected amount of shares to burn', async () => {
        const previewWithdrawResult = await vaultPreviewWithdraw(client, {
          vault: initialVault.address,
          amount: bigDecimal('1'),
          chainId: initialVault.chainId,
        });
        assertOk(previewWithdrawResult);
        expect(previewWithdrawResult.value).toEqual(
          expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeBigDecimalCloseTo(1, 4),
            }),
          }),
        );
      });
    });

    describe('When a user previews a redeeming shares from a vault', () => {
      it('Then it should return the expected amount of assets to receive', async () => {
        const previewRedeemResult = await vaultPreviewRedeem(client, {
          vault: initialVault.address,
          amount: bigDecimal('1'),
          chainId: initialVault.chainId,
        });
        assertOk(previewRedeemResult);
        expect(previewRedeemResult.value).toEqual(
          expect.objectContaining({
            amount: expect.objectContaining({
              value: expect.toBeBigDecimalCloseTo(1, 4),
            }),
          }),
        );
      });
    });
  });
});
