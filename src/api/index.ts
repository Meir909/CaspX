import type { User, UserRole } from '@/types'
import {
  clearSessionTokens,
  getAccessToken,
  getApiBaseUrl,
  getRefreshToken,
  isLiveApiEnabled,
  setSessionTokens,
} from '@/lib/session'

const PASSWORD_RESET_STORAGE_KEY = 'caspx-password-reset-requests'

type SessionTokens = {
  accessToken: string
  refreshToken: string
}

type ResetPasswordPayload = {
  token: string
  password: string
}

type PasswordResetRequestResult = {
  email: string
  mailtoLink: string
  resetLink: string
  expiresAt: string
}

type PasswordResetCompleteResult = {
  email: string
  confirmationMailtoLink: string
  user: User
}

type RequestOptions = {
  auth?: boolean
  retryOnAuth?: boolean
}

let currentUser: User = {
  id: 'local-user',
  name: 'CaspX User',
  email: '',
  phone: '+7',
  role: 'user',
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

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options: RequestOptions = {},
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

  if (response.status === 401 && options.auth && options.retryOnAuth !== false && getRefreshToken()) {
    await refreshTokens()
    return requestJson<T>(path, init, { ...options, retryOnAuth: false })
  }

  if (!response.ok) {
    throw new ApiRequestError(
      extractErrorMessage(payload, `Request failed with status ${response.status}`),
      response.status,
      payload,
    )
  }

  return payload as T
}

async function refreshTokens() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearSessionTokens()
    throw new Error('Сессия истекла. Выполните вход заново.')
  }

  const payload = await requestJson<unknown>(
    '/auth/refresh',
    {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    },
    { retryOnAuth: false },
  )

  const tokens = extractTokens(payload)
  if (!tokens) {
    clearSessionTokens()
    throw new Error('Backend не вернул новые токены.')
  }

  setSessionTokens(tokens)
  return tokens
}

function createPasswordResetRequest(email: string): PasswordResetRequestResult {
  const token = `reset-${crypto.randomUUID()}`
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  const resetLink = `${window.location.origin}/reset-password?token=${encodeURIComponent(token)}`
  const subject = encodeURIComponent('CaspX: восстановление доступа')
  const body = encodeURIComponent(
    [
      'Здравствуйте!',
      '',
      'Мы получили запрос на сброс пароля для вашего аккаунта CaspX.',
      `Ссылка для установки нового пароля: ${resetLink}`,
      `Ссылка действует до: ${new Date(expiresAt).toLocaleString('ru-RU')}`,
      '',
      'Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.',
    ].join('\n'),
  )

  const stored = localStorage.getItem(PASSWORD_RESET_STORAGE_KEY)
  const requests = stored ? (JSON.parse(stored) as Array<{ email: string; token: string; expiresAt: string }>) : []
  const nextRequests = [{ email, token, expiresAt }, ...requests.filter((item) => item.email !== email)]
  localStorage.setItem(PASSWORD_RESET_STORAGE_KEY, JSON.stringify(nextRequests))

  return {
    email,
    mailtoLink: `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`,
    resetLink,
    expiresAt,
  }
}

function createPasswordChangedConfirmation(email: string) {
  const subject = encodeURIComponent('CaspX: пароль успешно изменён')
  const body = encodeURIComponent(
    [
      'Здравствуйте!',
      '',
      'Ваш пароль в CaspX был успешно изменён.',
      'Если это были не вы, пожалуйста, немедленно восстановите доступ и свяжитесь с поддержкой.',
      '',
      `Аккаунт: ${email}`,
      `Время изменения: ${new Date().toLocaleString('ru-RU')}`,
    ].join('\n'),
  )

  return `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`
}

function consumePasswordResetToken(token: string, password: string) {
  const stored = localStorage.getItem(PASSWORD_RESET_STORAGE_KEY)
  const requests = stored ? (JSON.parse(stored) as Array<{ email: string; token: string; expiresAt: string }>) : []
  const request = requests.find((item) => item.token === token)

  if (!request) {
    throw new Error('Ссылка для сброса пароля не найдена или уже использована.')
  }

  if (new Date(request.expiresAt).getTime() < Date.now()) {
    localStorage.setItem(
      PASSWORD_RESET_STORAGE_KEY,
      JSON.stringify(requests.filter((item) => item.token !== token)),
    )
    throw new Error('Срок действия ссылки истек. Запросите сброс пароля заново.')
  }

  localStorage.setItem(
    PASSWORD_RESET_STORAGE_KEY,
    JSON.stringify(requests.filter((item) => item.token !== token)),
  )

  return {
    email: request.email,
    password,
  }
}

function mapTransportType(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('sea') || normalized.includes('мор')) return 'SEA'
  if (normalized.includes('multi') || normalized.includes('мульт')) return 'MULTIMODAL'
  return 'ROAD'
}

function requireLiveApi() {
  if (!isLiveApiEnabled()) {
    throw new Error('Live API отключён. Для работы нужен backend.')
  }
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
      const user = await api.auth.getProfile()
      currentUser = user
      return user
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

    forgotPassword: async (email: string): Promise<PasswordResetRequestResult> => createPasswordResetRequest(email),

    resetPassword: async ({ token, password }: ResetPasswordPayload): Promise<PasswordResetCompleteResult> => {
      const result = consumePasswordResetToken(token, password)
      const user: User = {
        ...currentUser,
        id: currentUser.id || `local-user-${Date.now()}`,
        name: currentUser.name || result.email.split('@')[0],
        email: result.email,
        phone: currentUser.phone || '+7',
        role: currentUser.role || 'user',
      }

      currentUser = user
      setSessionTokens({
        accessToken: `local-reset-${Date.now()}`,
        refreshToken: `local-reset-${Date.now() + 1}`,
      })

      return {
        email: result.email,
        confirmationMailtoLink: createPasswordChangedConfirmation(result.email),
        user,
      }
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

      const payload = await requestJson<unknown>(
        '/auth/me',
        { method: 'GET' },
        { auth: true },
      )

      const user = mapBackendUser(payload)
      currentUser = user
      return user
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
            transportType: mapTransportType(data.transportType || data.direction || 'road'),
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
