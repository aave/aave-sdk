import { InvariantError } from './helpers';

/**
 * @internal
 */
export type AnySelectionSet = object;

/**
 * @internal
 */
export type AnyVariables = Record<string, unknown>;

/**
 * @internal
 */
export type TypedSelectionSet<TTypename extends string = string> = {
  __typename: TTypename;
};

/*
 * Asserts that the node is of a specific type in a union.
 *
 * ```ts
 * type A = { __typename: 'A', a: string };
 * type B = { __typename: 'B', b: string };
 *
 * const node: A | B = { __typename: 'A', a: 'a' };
 *
 * assertTypename(node, 'A');
 *
 * console.log(node.a); // OK
 * ```
 *
 * @param node - The node to assert the typename of
 * @param typename - The expected typename
 */
export function assertTypename<Typename extends string>(
  node: TypedSelectionSet,
  typename: Typename,
): asserts node is TypedSelectionSet<Typename> {
  if (node.__typename !== typename) {
    throw new InvariantError(
      `Expected node to have typename "${typename}", but got "${node.__typename}"`,
    );
  }
}
