import { never } from '@aave/types';

/**
 * The environment configuration type.
 */
export type EnvironmentConfig = {
  name: string;
  backend: string;
};

/**
 * The mainnet environment configuration.
 */
export const mainnet: EnvironmentConfig = new Proxy<EnvironmentConfig>(
  {} as EnvironmentConfig,
  {
    get: () => {
      never(`The 'mainnet' environment is not available (yet)`);
    },
  },
);

/**
 * The testnet environment configuration.
 */
export const testnet: EnvironmentConfig = new Proxy<EnvironmentConfig>(
  {} as EnvironmentConfig,
  {
    get: () => {
      never(`The 'testnet' environment is not available (yet)`);
    },
  },
);

/**
 * @internal
 */
export const staging: EnvironmentConfig = new Proxy<EnvironmentConfig>(
  {} as EnvironmentConfig,
  {
    get: () => {
      never(`The 'staging' environment is not available (yet)`);
    },
  },
);

/**
 * @internal
 */
export const local: EnvironmentConfig = {
  name: 'local',
  backend: 'http://localhost:3000/graphql',
};
