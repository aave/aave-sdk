---
name: update-gql-schema
description: Use when updating the SDK GraphQL schema from a local or staging API server
---

# Update GraphQL Schema

Updates the SDK's GraphQL schema and related types from an API server instance.

## Usage

```
/update-gql-schema local    # Download from local server
/update-gql-schema staging  # Download from staging server
/update-gql-schema          # Will prompt for server choice
```

## Checklist

**You MUST use TodoWrite to create a todo for EACH step below. Mark each complete only after verification.**

### Download Schema

- [ ] Determine server source (from argument or ask user): `local` or `staging`
- [ ] Run schema download from `packages/graphql`:
  - Local: `pnpm gql:download:local`
  - Staging: `pnpm gql:download:staging`
- [ ] Run `pnpm gql:generate` to regenerate TypeScript introspection types

### Update Documents

- [ ] Cross-reference `packages/graphql/schema.graphql` with existing GQL documents
- [ ] Add missing fields to existing fragments
- [ ] Introduce new fragments if necessary
- [ ] If new queries or mutations exist in schema, ask user if they should be added

### Check for New Enums

- [ ] Search for new `enum` definitions in `packages/graphql/schema.graphql`
- [ ] For each new enum:
  - Add enum definition to `packages/graphql/src/enums.ts` with JSDoc comments
  - Import the enum type in `packages/graphql/src/graphql.ts`
  - Add scalar binding in `graphql.ts` scalars config (alphabetically ordered)
- [ ] Note: Do NOT create separate type exports for enums — the enum definition serves as both value and type

### Export Input Types

- [ ] Check for new input types in schema
- [ ] Common types (used across multiple queries): export from the appropriate shared file
- [ ] Query-specific types: colocate with corresponding query files (permits.ts, transactions.ts, user.ts, reserves.ts, etc.)
- [ ] Use pattern: `export type InputName = ReturnType<typeof graphql.scalar<'InputName'>>;`
- [ ] Ensure scalar bindings exist in `graphql.ts` for all input types

### Validate

**IMPORTANT: Do not mark the schema update complete until build and all tests pass.**

- [ ] Run `pnpm check` from `packages/graphql` to verify document integrity
- [ ] Run `pnpm build` to ensure TypeScript compilation succeeds
  - If build fails, fix the errors and re-run `pnpm build`
  - Repeat until build succeeds with zero errors
- [ ] Run `pnpm test --run` to verify tests pass
  - If tests fail, analyze failures, fix the code, and re-run tests
  - If the fix was in a sub-package compared to where the tests failed, re-run `pnpm build` first
  - Repeat until all tests pass
- [ ] Run `pnpm lint:fix` to format code
- [ ] Confirm both build and tests pass before marking complete

## Code Patterns

### Enum Definition (enums.ts)

```typescript
/**
 * Description of what this enum represents.
 */
export enum EnumName {
  /**
   * Description of this value
   */
  VALUE_ONE = 'VALUE_ONE',
  /**
   * Description of this value
   */
  VALUE_TWO = 'VALUE_TWO',
}
```

### Scalar Binding (graphql.ts)

```typescript
// Add to imports
import type { ..., EnumName } from './enums';

// Add to scalars config (alphabetically)
scalars: {
  ...
  EnumName: EnumName,
  ...
}
```

### Input Type Export

```typescript
export type InputName = ReturnType<typeof graphql.scalar<'InputName'>>;
```

## Stop Conditions

| Condition | Action |
|-----------|--------|
| Schema download fails | Check if server is running, verify URL |
| `pnpm check` fails | Fix document errors before proceeding |
| Build fails | Fix TypeScript errors, re-run build until it passes |
| Tests fail | Investigate and fix failing tests, re-run until all pass |

**Never mark the schema update as complete while build errors or test failures exist.** The iterative fix-and-verify loop is mandatory.

## Common Mistakes

1. **Creating type exports for enums** — Enums are both values and types; don't use `ReturnType<typeof graphql.scalar<'EnumName'>>`
2. **Adding new queries/mutations without being asked** — Only update existing documents unless explicitly requested
3. **Forgetting scalar bindings** — Every input type needs a corresponding entry in `graphql.ts`
4. **Non-alphabetical ordering** — Scalar bindings should be alphabetically ordered
5. **Missing JSDoc comments** — All enums should have documentation
6. **Marking complete with failing build/tests** — Always run `pnpm build` and `pnpm test --run` and fix all errors before marking complete
