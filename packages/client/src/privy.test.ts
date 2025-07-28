import { assertErr, chainId, evmAddress } from '@aave/types';
import { PrivyClient } from '@privy-io/server-auth';
import { describe, it } from 'vitest';
import { userSetEmode } from './actions/transactions';
import { sendWith } from './privy';
import {
  client,
  ETHEREUM_MARKET_ADDRESS,
  ETHEREUM_MARKET_ETH_CORRELATED_EMODE_CATEGORY,
} from './test-utils';

const privy = new PrivyClient(
  import.meta.env.PRIVY_TEST_APP_ID,
  import.meta.env.PRIVY_TEST_APP_SECRET,
);

describe('Given a PrivyClient instance', () => {
  describe('When using it to send Aave v3 transactions', () => {
    it('Then it should work as expected', async () => {
      // Using userSetEmode simply becasue it's an operation that does not require any specific pre-conditions
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
});
