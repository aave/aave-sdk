import type { Tagged } from 'type-fest';

/**
 * An identifier.
 */
export type ID = Tagged<string, 'ID'>;

/**
 * A Merkl reward program identifier (UUID) returned by the backend.
 */
export type RewardId = Tagged<string, 'RewardId'>;
