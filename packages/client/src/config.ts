import type { EnvironmentConfig } from '@aave/env';
import type { TypedDocumentNode } from '@urql/core';

/**
 * The client configuration.
 */
export type ClientConfig = {
  /**
   * The environment configuration to use (e.g. `mainnet`, `testnet`).
   */
  environment: EnvironmentConfig;
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
   */
  fragments?: TypedDocumentNode[];
};
