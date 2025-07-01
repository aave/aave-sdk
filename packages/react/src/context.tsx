import type { AaveClient } from '@aave/client';
import { invariant } from '@aave/types';
import React, { type ReactNode, useContext } from 'react';
import { Provider as UrqlProvider } from 'urql';

const AaveContext = React.createContext<AaveClient | null>(null);

/**
 * @internal
 */
export type AaveContextProviderProps = {
  children: ReactNode;
  client: AaveClient;
};

/**
 * @internal
 */
export function AaveContextProvider({
  children,
  client,
}: AaveContextProviderProps) {
  return (
    <AaveContext.Provider value={client}>
      <UrqlProvider value={client.urql}>{children}</UrqlProvider>
    </AaveContext.Provider>
  );
}

/**
 * Retrieve the injected {@link AaveClient} from the context.
 */
export function useAaveClient(): AaveClient {
  const client = useContext(AaveContext);

  invariant(
    client,
    'Could not find Aave SDK context, ensure your code is wrapped in a <AaveProvider>',
  );

  return client;
}
