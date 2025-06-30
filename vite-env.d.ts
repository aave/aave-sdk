/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ENVIRONMENT: 'testnet' | 'staging' | 'local' | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
