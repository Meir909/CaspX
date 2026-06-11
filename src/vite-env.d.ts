/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ENABLE_LIVE_API?: string
  readonly VITE_2GIS_MAP_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
