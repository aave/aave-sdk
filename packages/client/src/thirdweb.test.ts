import { assertOk, chainId, evmAddress } from '@aave/types';
import { AaveV3BaseSepolia } from '@bgd-labs/aave-address-book';
import { createThirdwebClient } from 'thirdweb';
import { describe, expect, it } from 'vitest';
import { permitTypedData } from './actions';
import { userSetEmode } from './actions/transactions';
import { client } from './test-utils';
import { sendWith, signERC20PermitWith } from './thirdweb';

const thirdwebClient = createThirdwebClient({
  secretKey: import.meta.env.THIRDWEB_TEST_SECRET_KEY,
});

const baseSepolia = chainId(AaveV3BaseSepolia.CHAIN_ID);
const market = evmAddress(AaveV3BaseSepolia.POOL);
const usdc = evmAddress(AaveV3BaseSepolia.ASSETS.USDC.UNDERLYING);

describe('Given a ThirdwebClient instance', () => {
  describe('When using it to send Aave v3 transactions', () => {
    it('Then it should work as expected', async () => {
      // Using userSetEmode simply because it's an operation that does not require any specific pre-conditions
      const result = await userSetEmode(client, {
        chainId: baseSepolia,
        market,
        categoryId: 1,
        user: evmAddress(import.meta.env.THIRDWEB_TEST_WALLET_ADDRESS),
      }).andThen(sendWith(thirdwebClient));

      assertOk(result);
    });
  });

  describe('When using it to sign an ERC20 permit', () => {
    it('Then it should resolve with the expected EIP712Signature object', async () => {
      const result = await permitTypedData(client, {
        currency: usdc,
        amount: '1',
        chainId: baseSepolia,
        spender: market,
        owner: evmAddress(import.meta.env.THIRDWEB_TEST_WALLET_ADDRESS),
      }).andThen(signERC20PermitWith(thirdwebClient));

      assertOk(result);
      expect(result.value).toEqual({
        deadline: expect.any(Number),
        value: expect.toBeHexString(),
      });
    });
  });
});
