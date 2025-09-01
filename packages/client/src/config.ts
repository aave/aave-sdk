import type { Context } from '@aave/core';
import type { TypedDocumentNode } from '@urql/core';
import type { EnvironmentConfig } from '../../core/src/types';
import { production } from './environments';

/**
 * The client configuration.
 */
export type ClientConfig = {
  /**
   * @internal
   * @defaultValue `production`
   */
  environment?: EnvironmentConfig;
  /**
   * @internal
   */
  headers?: Record<string, string>;
  /**
   * Whether to enable caching.
   *
   * @defaultValue `false`
   */
  cache?: boolean;
  /**
   * Whether to enable debug mode.
   *
   * @defaultValue `false`
   */
  debug?: boolean;
  /**
   * The custom fragments to use.
   *
   * @experimental This is an experimental API and may be subject to breaking changes.
   */
  fragments?: TypedDocumentNode[];
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
    fragments: from.fragments ?? [],
  };
}
