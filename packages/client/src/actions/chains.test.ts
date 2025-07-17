import { assertOk } from '@aave/client';
import { chains } from '@aave/client/actions';
import { client } from '@aave/client/test-utils';
import { describe, expect, it } from 'vitest';

describe('Given the Aave client', () => {
  describe(`When using the 'chains(client)' action`, () => {
    it('Then it should return the supported chains', async () => {
      const result = await chains(client);
      assertOk(result);
      expect(result.value).toMatchSnapshot();
    });
  });
});
