# `@aave/client`

The official TypeScript library for interacting with Aave Protocol.

---


The `@aave/client` package contains the core functionality to query markets, execute transactions, and manage user positions across Aave lending markets and vaults. It provides a type-safe interface with built-in error handling and result types.


## Usage

```ts
import { AaveClient, evmAddress, chainId } from '@aave/client';
import { supply, userSupplies } from '@aave/client/actions';
import { sendWith } from '@aave/client/viem';

// Create client
const client = AaveClient.create();

// Query user positions
const positions = await userSupplies(client, {
  markets: [evmAddress('0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2')],
  user: evmAddress('0x742d35cc6e5c4ce3b69a2a8c7c8e5f7e9a0b1234'),
});

// Execute transactions
const result = await supply(client, {
  market: evmAddress('0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2'),
  amount: {
    erc20: {
      currency: evmAddress('0xa0b86a33e6441c8c5f0bb9b7e5e1f8bbf5b78b5c'),
      value: '1000'
    }
  },
  supplier: evmAddress('0x742d35cc6e5c4ce3b69a2a8c7c8e5f7e9a0b1234'),
  chainId: chainId(1),
})
  .andThen(sendWith(wallet))
  .andThen(client.waitForTransaction);
```
