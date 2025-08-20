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
