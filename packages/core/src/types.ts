/**
 * The environment configuration type.
 */
export type EnvironmentConfig = {
  name: string;
  backend: string;
  indexingTimeout: number;
  pollingInterval: number;
  /**
   * How often to poll an order's status, in ms. Defaults to {@link DEFAULT_SWAP_STATUS_INTERVAL}.
   */
  swapStatusInterval?: number;
};

/**
 * The default interval between order status polls, in ms.
 */
export const DEFAULT_SWAP_STATUS_INTERVAL = 5_000;

/**
 * A standardized data object.
 *
 * All GQL operations should alias their results to `value` to ensure interoperability
 * with this client interface.
 */
export type StandardData<T> = { value: T };
