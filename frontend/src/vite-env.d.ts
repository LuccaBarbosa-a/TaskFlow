/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base do backend usada pelo proxy do Vite. */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
