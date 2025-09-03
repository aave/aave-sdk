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
 * A standardized data object.
 *
 * All GQL operations should alias their results to `value` to ensure interoperability
 * with this client interface.
 */
export type StandardData<T> = { value: T };
