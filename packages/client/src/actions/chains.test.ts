import { assertOk } from '@aave/client';
import { chains } from '@aave/client/actions';
import { client } from '@aave/client/test-utils';
import { describe, expect, it } from 'vitest';

describe('Given the Aave client', () => {
  describe(`when using the 'chains(client)' action`, () => {
    it('then it should return the supported chains', async () => {
      const result = await chains(client);
      assertOk(result);
      expect(result.value).toMatchInlineSnapshot(`
        [
          {
            "__typename": "Chain",
            "chainId": 1,
            "icon": "https://statics.aave.com/ethereum.svg",
            "name": "Ethereum",
          },
          {
            "__typename": "Chain",
            "chainId": 42161,
            "icon": "https://statics.aave.com/arbitrum.svg",
            "name": "Arbitrum",
          },
          {
            "__typename": "Chain",
            "chainId": 43114,
            "icon": "https://statics.aave.com/avalanche.svg",
            "name": "Avalanche",
          },
          {
            "__typename": "Chain",
            "chainId": 8453,
            "icon": "https://statics.aave.com/base.svg",
            "name": "Base",
          },
          {
            "__typename": "Chain",
            "chainId": 56,
            "icon": "https://statics.aave.com/bnbchain.svg",
            "name": "BSC",
          },
          {
            "__typename": "Chain",
            "chainId": 42220,
            "icon": "https://statics.aave.com/celo.svg",
            "name": "Celo",
          },
          {
            "__typename": "Chain",
            "chainId": 100,
            "icon": "https://statics.aave.com/Gnosis.svg",
            "name": "Gnosis",
          },
          {
            "__typename": "Chain",
            "chainId": 59144,
            "icon": "https://statics.aave.com/linea.svg",
            "name": "Linea",
          },
          {
            "__typename": "Chain",
            "chainId": 1088,
            "icon": "https://statics.aave.com/Metis.svg",
            "name": "Metis",
          },
          {
            "__typename": "Chain",
            "chainId": 10,
            "icon": "https://statics.aave.com/optimism.svg",
            "name": "Optimism",
          },
          {
            "__typename": "Chain",
            "chainId": 137,
            "icon": "https://statics.aave.com/polygon.svg",
            "name": "Polygon",
          },
          {
            "__typename": "Chain",
            "chainId": 534352,
            "icon": "https://statics.aave.com/scroll-network.svg",
            "name": "Scroll",
          },
          {
            "__typename": "Chain",
            "chainId": 1946,
            "icon": "https://statics.aave.com/soneium.svg",
            "name": "Soneium",
          },
          {
            "__typename": "Chain",
            "chainId": 146,
            "icon": "https://statics.aave.com/sonic.svg",
            "name": "Sonic",
          },
          {
            "__typename": "Chain",
            "chainId": 324,
            "icon": "https://statics.aave.com/zksync-era-light.svg",
            "name": "zkSync",
          },
        ]
      `);
    });
  });
});
