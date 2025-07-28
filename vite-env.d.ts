/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ENVIRONMENT: 'production' | 'staging' | 'local' | undefined;
  readonly PRIVY_TEST_APP_ID: string;
  readonly PRIVY_TEST_APP_SECRET: string;
  readonly PRIVY_TEST_WALLET_ID: string;
  readonly PRIVY_TEST_WALLET_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
