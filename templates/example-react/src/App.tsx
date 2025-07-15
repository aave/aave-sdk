import { AaveProvider } from '@aave/react';
import { client } from './client';

export function App() {
  return (
    <AaveProvider client={client}>
      <header>
        <h1>{{description}}</h1>
      </header>
      <div>
        <p>
          Edit <code>src/App.tsx</code>.
        </p>
      </div>
    </AaveProvider>
  );
}
