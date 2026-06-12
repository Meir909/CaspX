import type { User, UserRole } from '@/types'
import {
  clearSessionTokens,
  getAccessToken,
  getApiBaseUrl,
  getRefreshToken,
  isLiveApiEnabled,
  setSessionTokens,
} from '@/lib/session'

type SessionTokens = {
  accessToken: string
  refreshToken: string
}

class ApiRequestError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.payload = payload
  }
}

let currentUser: User = {
  id: 'local-user',
  name: 'CaspX User',
  email: '',
  phone: '+7',
  role: 'user',
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readString(source: Record<string, unknown>, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }

  return fallback
}

function readNullableString(source: Record<string, unknown>, keys: string[]) {
  const value = readString(source, keys)
  return value || undefined
}

function readBoolean(source: Record<string, unknown>, keys: string[], fallback = false) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'boolean') return value
  }

  return fallback
}

function parseJsonSafely(raw: string) {
  if (!raw) return null

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return raw
  }
}

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (!isPlainObject(payload)) return fallback

  const message = payload.message
  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message)) {
    const parts = message.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    if (parts.length) return parts.join(', ')
  }

  return readString(payload, ['error', 'detail'], fallback) || fallback
}

function getEnvelope(payload: unknown, key: string) {
  if (!isPlainObject(payload)) return undefined
  const nested = payload[key]
  return isPlainObject(nested) ? nested : payload
}

function extractTokens(payload: unknown): SessionTokens | null {
  if (!isPlainObject(payload)) return null

  const candidates = [payload, isPlainObject(payload.tokens) ? payload.tokens : null].filter(
    (item): item is Record<string, unknown> => Boolean(item),
  )

  for (const candidate of candidates) {
    const accessToken = readString(candidate, ['accessToken', 'access'])
    const refreshToken = readString(candidate, ['refreshToken', 'refresh'])

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken }
    }
  }

  return null
}

function splitFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] ?? 'CaspX',
    lastName: parts.slice(1).join(' ') || 'User',
  }
}

function mapRegistrationRole(role: UserRole | undefined) {
  switch (role) {
    case 'carrier':
      return 'CARRIER'
    case 'admin':
      return 'ADMIN'
    case 'akimat':
      return 'AKIMAT'
    default:
      return 'CLIENT'
  }
}

function toUserRole(role: string, carrierApproved: boolean): UserRole {
  const normalized = role.toLowerCase()

  if (normalized.includes('akimat')) return 'akimat'
  if (normalized.includes('admin')) return 'admin'
  if (normalized.includes('carrier') || carrierApproved) return 'carrier'
  return 'user'
}

function mapBackendUser(payload: unknown): User {
  const data = getEnvelope(payload, 'user') ?? {}
  const firstName = readString(data, ['firstName', 'first_name'])
  const lastName = readString(data, ['lastName', 'last_name'])
  const fullName = readString(data, ['name'], [firstName, lastName].filter(Boolean).join(' ').trim() || 'CaspX User')
  const isApproved = readBoolean(data, ['isApproved', 'approved'], false)
  const role = toUserRole(readString(data, ['role'], 'USER'), isApproved)

  return {
    id: readString(data, ['id', 'userId'], currentUser.id),
    name: fullName,
    email: readString(data, ['email'], currentUser.email),
    phone: readString(data, ['phone', 'phoneNumber'], currentUser.phone),
    role,
    company: readNullableString(data, ['company', 'companyName']),
    avatar: readNullableString(data, ['avatar', 'avatarUrl', 'photoUrl']),
    location: readNullableString(data, ['location', 'city']),
    carrierStatus: role === 'carrier' ? (isApproved ? 'approved' : 'pending') : undefined,
  }
}

function requireLiveApi() {
  if (!isLiveApiEnabled()) {
    throw new Error('Live API отключён. Для работы нужен backend.')
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options: { auth?: boolean; retryOnAuth?: boolean } = {},
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`
  const headers = new Headers(init.headers)
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData

  if (!headers.has('Content-Type') && init.body && !isFormData) {
    headers.set('Content-Type', 'application/json')
  }

  if (options.auth) {
    const accessToken = getAccessToken()
    if (!accessToken) {
      throw new Error('Нет access token. Выполните вход заново.')
    }
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(url, {
    ...init,
    headers,
  })

  const raw = await response.text()
  const payload = parseJsonSafely(raw)

  if (!response.ok) {
    throw new ApiRequestError(
      extractErrorMessage(payload, `Request failed with status ${response.status}`),
      response.status,
      payload,
    )
  }

  return payload as T
}

async function ensureProfile(): Promise<User> {
  const payload = await requestJson<unknown>(
    '/auth/me',
    { method: 'GET' },
    { auth: true },
  )

  const user = mapBackendUser(payload)
  currentUser = user
  return user
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      requireLiveApi()

      const payload = await requestJson<unknown>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        },
      )

      const tokens = extractTokens(payload)
      if (!tokens) {
        throw new Error('Backend не вернул access/refresh token.')
      }

      setSessionTokens(tokens)
      return ensureProfile()
    },

    register: async (data: Partial<User> & { password?: string }): Promise<User> => {
      requireLiveApi()

      const name = splitFullName(data.name || '')

      await requestJson(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify({
            firstName: name.firstName,
            lastName: name.lastName,
            email: data.email,
            phone: data.phone,
            password: data.password,
            role: mapRegistrationRole(data.role),
          }),
        },
      )

      if (!data.email || !data.password) {
        throw new Error('Регистрация прошла, но не хватает email/password для автоматического входа.')
      }

      return api.auth.login(data.email, data.password)
    },

    logout: async (): Promise<void> => {
      requireLiveApi()

      const refreshToken = getRefreshToken()
      if (refreshToken) {
        try {
          await requestJson(
            '/auth/logout',
            {
              method: 'POST',
              body: JSON.stringify({ refreshToken }),
            },
            { retryOnAuth: false },
          )
        } finally {
          clearSessionTokens()
        }
      } else {
        clearSessionTokens()
      }
    },

    getProfile: async (): Promise<User> => {
      requireLiveApi()
      return ensureProfile()
    },

    updateProfile: async (data: {
      name?: string
      phone?: string
      avatar?: string
    }): Promise<User> => {
      requireLiveApi()

      const payload = await requestJson<unknown>(
        '/auth/me',
        {
          method: 'PATCH',
          body: JSON.stringify({
            name: data.name?.trim() || undefined,
            phone: data.phone?.trim() || undefined,
            avatar: data.avatar?.trim() || undefined,
          }),
        },
        { auth: true },
      )

      const nextUser = mapBackendUser(payload)
      currentUser = nextUser
      return nextUser
    },

    becomeCarrier: async (data: {
      company?: string
      businessId?: string
      direction?: string
      capacity?: string
      experience?: string
      volume?: string
      plate?: string
      transportType?: string
      transportImage?: string
    }): Promise<User> => {
      requireLiveApi()

      await requestJson(
        '/carrier/apply',
        {
          method: 'POST',
          body: JSON.stringify({
            experienceYears: Number.parseInt(data.experience || '0', 10),
            transportType: data.transportType || data.direction || 'ROAD',
            description: [
              data.company ? `Компания: ${data.company}` : '',
              data.businessId ? `БИН: ${data.businessId}` : '',
              data.plate ? `Номер: ${data.plate}` : '',
            ]
              .filter(Boolean)
              .join(' | '),
          }),
        },
        { auth: true },
      )

      currentUser = {
        ...currentUser,
        role: 'carrier',
        company: data.company || currentUser.company,
        carrierStatus: 'pending',
      }

      return currentUser
    },
  },
}
