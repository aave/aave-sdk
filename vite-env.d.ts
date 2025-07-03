/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly ENVIRONMENT: 'testnet' | 'staging' | 'local' | undefined;
  readonly PRIVATE_KEY: `0x${string}`;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
