import { never } from '@aave/types';

/**
 * The environment configuration type.
 */
export type EnvironmentConfig = {
  name: string;
  backend: string;
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
  backend: 'http://localhost:3011/graphql',
};
