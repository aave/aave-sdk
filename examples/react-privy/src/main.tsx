import { AaveProvider } from '@aave/react';
import { PrivyProvider } from '@privy-io/react-auth';
import { createRoot } from 'react-dom/client';
import { mainnet } from 'viem/chains';
import { App } from './App';
import { client } from './client';

createRoot(document.getElementById('root')!).render(
  <PrivyProvider
    appId={import.meta.env.VITE_PRIVY_APP_ID}
    clientId={import.meta.env.VITE_PRIVY_CLIENT_ID}
    config={{
      supportedChains: [mainnet],
    }}
  >
    <AaveProvider client={client}>
      <App />
    </AaveProvider>
  </PrivyProvider>,
);
