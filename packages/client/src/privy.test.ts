import { assertErr, assertOk, chainId, evmAddress } from '@aave/types';
import { PrivyClient } from '@privy-io/server-auth';
import { describe, expect, it } from 'vitest';
import { permitTypedData } from './actions';
import { userSetEmode } from './actions/transactions';
import { sendWith, signERC20PermitWith } from './privy';
import {
  client,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY,
  ETHEREUM_USDC_ADDRESS,
} from './test-utils';

const privy = new PrivyClient(
  import.meta.env.PRIVY_TEST_APP_ID,
  import.meta.env.PRIVY_TEST_APP_SECRET,
);

describe('Given a PrivyClient instance', () => {
  describe('When using it to send Aave v3 transactions', () => {
    it('Then it should work as expected (within current testability constraints)', async () => {
      // Using userSetEmode simply because it's an operation that does not require any specific pre-conditions
      const result = await userSetEmode(client, {
        chainId: chainId(1),
        market: ETHEREUM_MARKET_ADDRESS,
        categoryId: ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY,
        user: evmAddress(import.meta.env.PRIVY_TEST_WALLET_ADDRESS),
      }).andThen(sendWith(privy, import.meta.env.PRIVY_TEST_WALLET_ID));

      // At this stage we are happy we can attempt to send a transaction, this can be improved later
      assertErr(result);
    });
  });

  describe('When using it to sign an ERC20 permit', () => {
    it('Then it should resolve with the expected EIP712Signature object', async () => {
      const result = await permitTypedData(client, {
        market: ETHEREUM_MARKET_ADDRESS,
        underlyingToken: ETHEREUM_USDC_ADDRESS,
        amount: '1',
        chainId: chainId(1),
        spender: evmAddress('0x0000000000000000000000000000000000000000'),
        owner: evmAddress('0x0000000000000000000000000000000000000000'),
      }).andThen(
        signERC20PermitWith(privy, import.meta.env.PRIVY_TEST_WALLET_ID),
      );

      assertOk(result);
      expect(result.value).toEqual({
        deadline: expect.any(Number),
        value: expect.toBeHexString(),
      });
    });
  });
});
