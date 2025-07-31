/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ENVIRONMENT: 'production' | 'staging' | 'local' | undefined;
  readonly PRIVY_TEST_APP_ID: string;
  readonly PRIVY_TEST_APP_SECRET: string;
  readonly PRIVY_TEST_WALLET_ID: string;
  readonly PRIVY_TEST_WALLET_ADDRESS: string;
  readonly ETHEREUM_TENDERLY_FORK_ID: string;
  readonly ETHEREUM_TENDERLY_PUBLIC_RPC: string;
  readonly ETHEREUM_TENDERLY_ADMIN_RPC: string;
  readonly ETHEREUM_TENDERLY_BLOCKEXPLORER: string;
  readonly API_X_E2E_TESTS_HEADER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
