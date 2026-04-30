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

## Repo skills

- If the user asks to publish a snapshot release, create a preview/canary/next npm release, or otherwise mentions a snapshot publish workflow, load and follow `.claude/skills/snapshot/SKILL.md`.
- If the user asks to publish a normal package release, load and follow `.claude/skills/publish/SKILL.md`.

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
