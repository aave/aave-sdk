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

Before creating a snapshot, make sure your working tree is clean:

git status --short

If there are uncommitted changes, commit or stash them first.

pnpm changeset version --snapshot preview
pnpm build
pnpm changeset publish --tag preview --no-git-checks

Replace `preview` with any dist-tag you want (e.g. `canary`, `next`). Published versions follow the format `0.0.0-<tag>-<timestamp>`.

After publishing, restore the snapshot version changes:

git restore .

**To install a snapshot:**
pnpm add @aave/client@preview           # latest under that tag
pnpm add @aave/client@0.0.0-preview-20260427120000  # specific version

Do not commit the version bump that `changeset version --snapshot` produces.