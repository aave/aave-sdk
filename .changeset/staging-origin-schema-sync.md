---
"@aave/graphql": minor
"@aave/client": minor
---

Point the `staging` environment at `https://api.origin.staging.aave.com/v3/graphql` and sync the GraphQL schema with it.

- Root types are now `V3Query` and `V3Mutation` (previously `Query`); existing operations are unchanged.
- `SupplyRequest` and `BorrowRequest` accept an optional `referralCode`.
- The schema now includes the position migration and swap order operations; no SDK actions or hooks are exposed for them yet.
