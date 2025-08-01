import { AaveProvider } from '@aave/react';
import { createRoot } from 'react-dom/client';
import { ThirdwebProvider } from 'thirdweb/react';
import { App } from './App';
import { client } from './client';

createRoot(document.getElementById('root')!).render(
  <AaveProvider client={client}>
    <ThirdwebProvider>
      <App />
    </ThirdwebProvider>
  </AaveProvider>,
);
