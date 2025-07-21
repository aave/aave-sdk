# `@aave/react`

The official React bindings for the Aave Protocol.

---

## Usage

### Setup

```typescript
// client.ts
import { AaveClient } from '@aave/react';

export const client = AaveClient.create();
```

```tsx
// App.tsx
import { AaveProvider } from '@aave/react';
import { client } from './client';

export function App() {
  return (
    <AaveProvider client={client}>
      <MarketData />
      <UserPositions />
    </AaveProvider>
  );
}
```

### Query Data

```tsx
import { evmAddress, useAaveChains, useUserSupplies } from '@aave/react';

function MarketData() {
  const { data: chains, loading } = useAaveChains();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {chains?.map(chain => (
        <div key={chain.id}>{chain.name}</div>
      ))}
    </div>
  );
}

function UserPositions() {
  const { data: supplies } = useUserSupplies({
    markets: [evmAddress('0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2')],
    user: evmAddress('0x742d35cc6e5c4ce3b69a2a8c7c8e5f7e9a0b1234'),
  });
  
  return <div>Supplies: {supplies?.length || 0}</div>;
}
```
