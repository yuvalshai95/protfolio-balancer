/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EODHD_API_KEY: string;
  readonly VITE_USE_MOCK_DATA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
