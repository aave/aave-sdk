# AGENTS.md
 
## Dev environment tips

- Use `nvm use` to use the correct Node.js version.
- Use `corepack enable` to install the correct version of pnpm.
- Use `pnpm install` to install the dependencies.
- Use `pnpm build` to build the project.

## Testing instructions

- Use `pnpm test:client --run` to run `@aave/client` tests.
- Use `pnpm test:react --run` to run `@aave/react` tests.
- Use `pnpm vitest --run --project <project-name> <path-to-test-file> -t "<test-name>"` to focus on one single test.

## Snapshot Releases

Snapshot releases publish packages for testing without updating the real versions. Run locally:

```bash
pnpm changeset version --snapshot preview
pnpm changeset publish --tag preview --no-git-checks
```

Replace `preview` with any dist-tag you want (e.g. `canary`, `next`). Published versions follow the format `0.0.0-<tag>-<timestamp>`.

**To install a snapshot:**
```bash
pnpm add @aave/client@preview           # latest under that tag
pnpm add @aave/client@0.0.0-preview-20260427120000  # specific version
```

Do not commit the version bump that `changeset version --snapshot` produces.

## Commits & Changesets

**Commits:** conventional format (`fix:`, `feat:`, `chore:`), no `Co-Authored-By` trailers.

**Changesets:** Create manually in `.changeset/` (e.g., `adjective-noun-verb.md`):
```
---
"@aave/graphql": patch
"@aave/client": patch
"@aave/react": patch
---

**fix:** description using `backticks` for code references
```

- `patch` = bug fix, `minor` = feature, `major` = breaking change
- Always include `@aave/client` and `@aave/react` when changing their dependencies (`@aave/graphql`, `@aave/types`, `@aave/core`)
- One-line description only, bold type prefix (`**fix:**`)