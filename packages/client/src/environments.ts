import { never } from '@aave/types';

/**
 * The environment configuration type.
 */
export type EnvironmentConfig = {
  name: string;
  backend: string;
  indexingTimeout: number;
  pollingInterval: number;
};

/**
 * The production environment configuration.
 */
export const production: EnvironmentConfig = new Proxy<EnvironmentConfig>(
  {} as EnvironmentConfig,
  {
    get: () => {
      never(`The 'production' environment is not available (yet)`);
    },
  },
);

/**
 * @internal
 */
export const staging: EnvironmentConfig = {
  name: 'staging',
  backend: 'https://api.v3.staging.aave.com/graphql',
  indexingTimeout: 60_000,
  pollingInterval: 100,
};

/**
 * @internal
 */
export const local: EnvironmentConfig = {
  name: 'local',
  backend: 'http://localhost:3011/graphql',
  indexingTimeout: 60_000,
  pollingInterval: 1000,
};
