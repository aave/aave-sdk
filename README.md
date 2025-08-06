# Aave SDK <!-- omit in toc -->

The official SDK for Aave V3 👻.

## Table of Contents <!-- omit in toc -->

- [Installation](#installation)
- [Development Workflow](#development-workflow)
- [Contributing](#contributing)
- [License](#license)

## Installation

## Development Workflow

This section is for developers who want to contribute to the SDK.

### Initial Setup <!-- omit in toc -->

Clone the repository:

```bash
git clone https://github.com/aave/aave-sdk.git
```

Install the dependencies:

```bash
pnpm install
```

### Pre-requisites: <!-- omit in toc -->

- Node.js: >= v22. See [installation guide](https://nodejs.org/en/download/package-manager).
- pnpm: v9.15.4. See [installation guide](https://pnpm.io/installation).

Use [nvm](https://github.com/nvm-sh/nvm) to manage your Node.js versions. Run the following command in the project root folder:

```bash
nvm use
```

to switch to the correct Node.js version.

Enable [corepack](https://www.totaltypescript.com/how-to-use-corepack) to use the the correct version of `pnpm`.

Run the following command in the project root folder:

```bash
corepack install
```

to install the correct version once. After that corepack will automatically use the correct version of `pnpm` when entering the project folder.

Create a `.env` file copying the `.env.example` file:

```bash
cp .env.example .env
```

Update the `.env` file with the correct values.

### Usage <!-- omit in toc -->

Run the tests:

- `pnpm test:client`: Run the tests for the `@aave/client` package.

Lint the code:

```bash
pnpm lint
```

Compile the code:

```bash
pnpm build
```

Clean the build:

```bash
pnpm clean
```

Create a new package:

```bash
pnpm new:package
```

### IDE Setup <!-- omit in toc -->

The project uses [Biome](https://biomejs.dev/) to format and lint the code. You can install the Biome extension for your IDE: https://biomejs.dev/guides/editors/first-party-extensions/

## Contributing

We welcome contributions to the Aave SDK! If you're interested in contributing, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with clear messages.
4. Push your changes to your fork.
5. Open a pull request against the `main` branch of the original repository.
6. Ensure your code adheres to the project's coding standards and passes all tests.
7. Wait for code review and address any feedback provided by the maintainers.

If you have a pressing issue or feature request, please open an issue on GitHub.
A lot of the abstraction is in the API so somethings could be out of scope in the SDK but we are happy to discuss it on the GitHub issues. 

## License

Aave SDK is [MIT licensed](./LICENSE).
