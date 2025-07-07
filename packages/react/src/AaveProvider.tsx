import type { AaveClient } from '@aave/client';
// biome-ignore lint/correctness/noUnusedImports: intentional
import React, { type ReactNode } from 'react';

import { AaveContextProvider } from './context';

/**
 * <AaveProvider> props
 */
export type AaveProviderProps = {
  /**
   * The children to render
   */
  children: ReactNode;
  /**
   * The Aave client instance to use
   */
  client: AaveClient;
};

/**
 * Manages the internal state of the Aave SDK.
 *
 * ```tsx
 * import { AaveProvider, AaveClient, production } from '@aave/react';
 *
 * const client = AaveClient.create({
 *   environment: production,
 * });
 *
 * function App() {
 *   return (
 *     <AaveProvider client={client}>
 *        // ...
 *     </AaveProvider>
 *   );
 * }
 * ```
 */
export function AaveProvider({ children, client }: AaveProviderProps) {
  return <AaveContextProvider client={client}>{children}</AaveContextProvider>;
}
