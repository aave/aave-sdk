import type { ClientConfig } from './config';
import { type EnvironmentConfig, production } from './environments';
import { FragmentResolver } from './fragments';

/**
 * @internal
 */
export type Context = {
  environment: EnvironmentConfig;
  headers?: Record<string, string>;
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
    headers: from.headers,
    cache: from.cache ?? false,
    debug: from.debug ?? false,
    fragments: FragmentResolver.from(from.fragments ?? []),
  };
}
