/// <reference types="vite/client" />

// Optional: strongly type your custom env vars
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
