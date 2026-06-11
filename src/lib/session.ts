export const ACCESS_TOKEN_STORAGE_KEY = 'caspx-access-token'
export const REFRESH_TOKEN_STORAGE_KEY = 'caspx-refresh-token'

const FALLBACK_API_BASE_URL = 'https://api-angels.byapex.dev'

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL).replace(/\/+$/, '')
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
