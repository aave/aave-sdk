---
name: publish
description: Use when manually publishing SDK packages to npm registry, after all changes are merged to main
---

# Publish SDK Packages

Publishes `@aave` packages to npm using changesets.

## Checklist

**You MUST use TaskCreate to create a task for EACH step below. Mark each complete only after verification.**

### Pre-flight

- [ ] Verify on `main` branch and up-to-date: `git checkout main && git pull`
- [ ] Verify working directory is clean: `git status` shows no uncommitted changes
- [ ] Run `corepack enable` to ensure correct pnpm version
- [ ] Run `pnpm install` to update dependencies
- [ ] Run `pnpm build` to build all packages

### Version Bump

- [ ] Run `pnpm changeset status` to check for pending changesets (if none exist, nothing to publish — STOP)
- [ ] Run `pnpm changeset version` to bump versions
- [ ] Review the version output and confirm changes look correct
- [ ] Stage and commit changed files: `git add <changed files> && git commit -m "chore: bumps up versions"`

### Publish

- [ ] Verify npm authentication: run `npm whoami`
  - If it fails: ask user to run `npm login` then re-verify
- [ ] Ask user to run `pnpm changeset publish` from their interactive terminal (no OTP required)
- [ ] Wait for user to confirm publish is done
- [ ] Run `git push --follow-tags`
  - If direct push to main is rejected (branch protection): create a `chore/bump-versions` branch, push it, and open a PR

## Stop Conditions

| Condition | Action |
|-----------|--------|
| Not on main branch | `git checkout main && git pull` first |
| Uncommitted changes | Stash or commit first |
| `pnpm changeset status` shows no changesets | Nothing to publish — inform user |
| `npm whoami` fails | Ask user to run `npm login` |

## Common Mistakes

1. **Forgetting `--follow-tags`** — Git tags not pushed, npm versions unlinked from git history
2. **Committing after `git push --follow-tags`** — Version bump commit must be pushed before tags, not after
3. **Assuming direct push to main works** — Branch protection requires a PR; tags still push fine
