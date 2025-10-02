import type { TypedDocumentNode } from '@urql/core';
import type { EnvironmentConfig } from './types';

/**
 * @internal
 */
export type Context = {
  environment: EnvironmentConfig;
  headers?: Record<string, string>;
  cache: boolean;
  debug: boolean;
  fragments: TypedDocumentNode[];
};
