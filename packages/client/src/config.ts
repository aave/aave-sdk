import type { TypedDocumentNode } from '@urql/core';
import type { EnvironmentConfig } from './environments';

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
