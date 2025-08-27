import { assertOk, ChainsFilter } from '@aave/client';
import { chains } from '@aave/client/actions';
import { client } from '@aave/client/test-utils';
import { describe, expect, it } from 'vitest';

describe('Given the Aave client', () => {
  describe(`When using the 'chains(client)' action`, () => {
    it('Then it should return the supported chains', async () => {
      const result = await chains(client, ChainsFilter.ALL);
      assertOk(result);
      // Sort by chainId to make the snapshot stable
      const sortedChains = result.value.sort((a, b) => a.chainId - b.chainId);
      expect(sortedChains).toMatchSnapshot();
    });
  });
});
