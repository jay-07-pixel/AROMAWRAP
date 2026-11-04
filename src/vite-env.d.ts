/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_MERCHANT_UPI_ID: string;
  readonly VITE_MERCHANT_NAME?: string;
  /** Google Identity Services web client ID (public). Same value as server GOOGLE_CLIENT_ID. */
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

