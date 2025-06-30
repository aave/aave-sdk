import type { Tagged } from 'type-fest';
import { tag } from './tag';

/**
 * A void value.
 */
export type Void = Tagged<undefined, 'Void'>;

/**
 * A DateTime string in ISO 8601 format.
 */
export type DateTime = Tagged<string, 'DateTime'>;
export const dateTime = tag<DateTime>;

/**
 * Beautify the  readout of all of the members of that intersection.
 *
 * @see https://twitter.com/mattpocockuk/status/1622730173446557697
 *
 * @internal
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
