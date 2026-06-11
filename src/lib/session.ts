export const ACCESS_TOKEN_STORAGE_KEY = 'caspx-access-token'
export const REFRESH_TOKEN_STORAGE_KEY = 'caspx-refresh-token'

const FALLBACK_API_BASE_URL = 'https://api-angels.byapex.dev'
const DEV_PROXY_API_BASE_URL = '/api'

export function getApiBaseUrl() {
  const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL).replace(/\/+$/, '')

  // In local Vite development we intentionally route API traffic through `/api`
  // so the browser talks to the dev server proxy instead of hitting the backend
  // origin directly and tripping over CORS preflight checks.
  if (import.meta.env.DEV) {
    return DEV_PROXY_API_BASE_URL
  }

  return configuredBaseUrl
}

export function isLiveApiEnabled() {
  return import.meta.env.VITE_ENABLE_LIVE_API !== 'false'
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

export function hasLocalSessionToken() {
  return getAccessToken()?.startsWith('local-') === true
}

export function setSessionTokens(tokens: { accessToken: string; refreshToken: string }) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken)
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken)
}

export function clearSessionTokens() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
}

export function hasSessionTokens() {
  return Boolean(getAccessToken() && getRefreshToken())
}
