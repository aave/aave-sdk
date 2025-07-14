import { type EnvironmentConfig, production } from '@aave/env';

import type { ClientConfig } from './config';
import { FragmentResolver } from './fragments';

/**
 * @internal
 */
export type Context = {
  environment: EnvironmentConfig;
  cache: boolean;
  debug: boolean;
  fragments: FragmentResolver;
};

/**
 * @internal
 */
export function configureContext(from: ClientConfig): Context {
  return {
    environment: from.environment ?? production,
    cache: from.cache ?? false,
    debug: from.debug ?? false,
    fragments: FragmentResolver.from(from.fragments ?? []),
  };
}
