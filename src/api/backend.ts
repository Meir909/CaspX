import type { CarrierProfile, CarrierVehicle, Order } from '@/types'
import { api } from '@/api'
import {
  clearSessionTokens,
  getAccessToken,
  getApiBaseUrl,
  getRefreshToken,
  hasLocalSessionToken,
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : []
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

function readNumber(source: Record<string, unknown>, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }

  return fallback
}

function readBoolean(source: Record<string, unknown>, keys: string[], fallback = false) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'boolean') return value
  }

  return fallback
}

function readStringArray(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    }
  }

  return [] as string[]
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

function parseJsonSafely(raw: string) {
  if (!raw) return null

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return raw
  }
}

function splitPoint(value: string) {
  const parts = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)

  if (parts.length >= 2) {
    return {
      country: parts[0],
      city: parts.slice(1).join(', '),
    }
  }

  return { city: value.trim() }
}

function toFrontendStatus(status: string): Order['status'] {
  switch (status.toUpperCase()) {
    case 'NEW':
      return 'created'
    case 'SEARCHING':
      return 'searching'
    case 'ASSIGNED':
      return 'assigned'
    case 'IN_TRANSIT':
      return 'in_progress'
    case 'DELIVERED':
      return 'delivered'
    case 'CANCELLED':
      return 'cancelled'
    default:
      return 'searching'
  }
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

function isUsingLiveApi() {
  return isLiveApiEnabled() && !hasLocalSessionToken()
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options: { auth?: boolean; retryOnAuth?: boolean } = {},
): Promise<T> {
  const url = `${getApiBaseUrl()}${path}`
  const headers = new Headers(init.headers)

  if (!headers.has('Content-Type') && init.body) {
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

function mapOrder(payload: unknown): Order {
  const data = getEnvelope(payload, 'order') ?? {}
  const originRaw = readString(data, ['origin'], 'Маршрут не указан')
  const destinationRaw = readString(data, ['destination'], 'Маршрут не указан')
  const origin = splitPoint(originRaw)
  const destination = splitPoint(destinationRaw)
  const createdAt = readString(data, ['createdAt', 'updatedAt'], new Date().toISOString())
  const deliveryTimeHours = readNumber(data, ['estimatedDeliveryTime'], 72)
  const estimatedPrice = readNumber(data, ['estimatedPrice'], 0)
  const cargoPhotoUrl = readNullableString(data, ['cargoPhotoUrl'])
  const productPhotoUrls = readStringArray(data, ['productPhotoUrls'])
  const cargoImages = [cargoPhotoUrl, ...productPhotoUrls].filter(
    (item, index, array): item is string => Boolean(item) && array.indexOf(item) === index,
  )
  const from = readString(data, ['originCity'], origin.city)
  const fromCountry = readNullableString(data, ['originCountry']) || origin.country
  const to = readString(data, ['destinationCity'], destination.city)
  const toCountry = readNullableString(data, ['destinationCountry']) || destination.country

  return {
    id: readString(data, ['id'], `${Date.now()}`),
    number: readString(data, ['number', 'orderNumber'], readString(data, ['id'], '')),
    from,
    fromCountry,
    fromRegion: fromCountry,
    to,
    toCountry,
    toRegion: toCountry,
    cargoType: readString(data, ['cargoType'], 'Cargo'),
    weight: readNumber(data, ['weight'], 0),
    volume: readNumber(data, ['volume'], 0),
    places: readNumber(data, ['places'], Math.max(1, cargoImages.length)),
    pickupDate: createdAt,
    deliveryDate: new Date(new Date(createdAt).getTime() + deliveryTimeHours * 60 * 60 * 1000).toISOString(),
    transportType: readString(data, ['transportType'], 'TRUCK'),
    price: estimatedPrice,
    comment: readNullableString(data, ['comment']),
    requirements: [],
    notes: readNullableString(data, ['title']),
    status: toFrontendStatus(readString(data, ['status'], 'SEARCHING')),
    carrierId: readNullableString(data, ['carrierId']),
    createdAt,
    routeStops: [
      { title: from, subtitle: fromCountry || 'Пункт отправки', color: 'blue' },
      { title: to, subtitle: toCountry || 'Пункт доставки', color: 'violet' },
    ],
    trackingEvents: [
      { time: 'Сейчас', title: 'Заказ получен от backend', location: originRaw },
      { time: 'Ожидается', title: 'Ожидание realtime tracking', location: destinationRaw },
    ],
    cargoImages,
    progressLabel: '0 км',
    remainingLabel: `${deliveryTimeHours} ч`,
    speedLabel: 'Ожидание',
  }
}

function mapOrdersList(payload: unknown): Order[] {
  if (!isPlainObject(payload)) return []
  return asArray(payload.orders).map((item) => mapOrder({ order: item }))
}

function mapCarrierProfile(payload: unknown): CarrierProfile {
  const data = getEnvelope(payload, 'carrierProfile') ?? {}
  const nestedUser = isPlainObject(data.user) ? data.user : {}
  const fullName =
    [
      readString(nestedUser, ['firstName', 'first_name']),
      readString(nestedUser, ['lastName', 'last_name']),
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || readString(nestedUser, ['name'], 'Carrier')

  return {
    id: readString(data, ['id'], ''),
    userId: readString(data, ['userId', 'carrierId'], ''),
    experienceYears: readNumber(data, ['experienceYears'], 0),
    transportType: readString(data, ['transportType'], 'ROAD'),
    description: readNullableString(data, ['description']),
    isApproved: readBoolean(data, ['isApproved'], false),
    createdAt: readString(data, ['createdAt'], new Date().toISOString()),
    updatedAt: readString(data, ['updatedAt'], new Date().toISOString()),
    user: {
      id: readNullableString(nestedUser, ['id', 'userId']),
      name: fullName,
      email: readNullableString(nestedUser, ['email']),
      phone: readNullableString(nestedUser, ['phone', 'phoneNumber']),
      company: readNullableString(nestedUser, ['company', 'companyName']),
      avatar: readNullableString(nestedUser, ['avatar', 'avatarUrl', 'photoUrl']),
    },
    vehiclesCount: readNumber(data, ['vehiclesCount'], 0),
  }
}

function mapVehicle(payload: unknown): CarrierVehicle {
  const data = getEnvelope(payload, 'vehicle') ?? {}

  return {
    id: readString(data, ['id'], ''),
    carrierId: readString(data, ['carrierId'], ''),
    type: readString(data, ['type'], 'TRUCK'),
    brand: readString(data, ['brand'], 'Transport'),
    model: readString(data, ['model'], ''),
    year: readNumber(data, ['year'], new Date().getFullYear()),
    plateNumber: readString(data, ['plateNumber'], ''),
    capacityTons: readNumber(data, ['capacityTons'], 0),
    cargoVolume: readNumber(data, ['cargoVolume'], 0),
    vehicleImageUrl: readNullableString(data, ['vehicleImageUrl']),
    createdAt: readString(data, ['createdAt'], new Date().toISOString()),
    updatedAt: readString(data, ['updatedAt'], new Date().toISOString()),
  }
}

function mapVehiclesList(payload: unknown): CarrierVehicle[] {
  if (!isPlainObject(payload)) return []
  return asArray(payload.vehicles).map((item) => mapVehicle({ vehicle: item }))
}

export const backendApi = {
  orders: {
    getOrders: async () => {
      if (!isUsingLiveApi()) {
        return api.orders.getOrders()
      }

      try {
        const payload = await requestJson<unknown>(
          '/orders/my',
          { method: 'GET' },
          { auth: true },
        )
        return mapOrdersList(payload)
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
          const payload = await requestJson<unknown>(
            '/orders',
            { method: 'GET' },
            { auth: true },
          )
          return mapOrdersList(payload)
        }
        throw error
      }
    },

    getOrder: async (id: string) => {
      if (!isUsingLiveApi()) {
        return api.orders.getOrder(id)
      }

      const payload = await requestJson<unknown>(
        `/orders/${id}`,
        { method: 'GET' },
        { auth: true },
      )

      return mapOrder(payload)
    },

    createOrder: async (data: Partial<Order> & {
      from: string
      to: string
      fromCountry?: string
      toCountry?: string
      cargoType: string
      weight: string | number
      volume: string | number
      date: string
      cargoImages?: string[]
    }) => {
      if (!isUsingLiveApi()) {
        return api.orders.createOrder(data)
      }

      const origin = [data.fromCountry, data.from].filter(Boolean).join(', ')
      const destination = [data.toCountry, data.to].filter(Boolean).join(', ')
      const payload = await requestJson<unknown>(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify({
            title: `${data.cargoType}: ${origin} -> ${destination}`,
            cargoType: data.cargoType,
            weight: Number(data.weight),
            volume: Number(data.volume),
            origin,
            originCity: data.from,
            originCountry: data.fromCountry,
            destination,
            destinationCity: data.to,
            destinationCountry: data.toCountry,
            cargoPhotoUrl: data.cargoImages?.[0],
            productPhotoUrls: data.cargoImages ?? [],
            comment: data.comment || undefined,
          }),
        },
        { auth: true },
      )

      return mapOrder(payload)
    },

    getAvailableOrders: async () => {
      if (!isUsingLiveApi()) {
        const orders = await api.orders.getOrders()
        return orders.filter((order) => order.status === 'searching')
      }

      const payload = await requestJson<unknown>(
        '/orders/available',
        { method: 'GET' },
        { auth: true },
      )

      return mapOrdersList(payload)
    },
  },

  carrier: {
    getProfile: async () => {
      if (!isUsingLiveApi()) {
        return {
          id: '',
          userId: '',
          experienceYears: 0,
          transportType: 'ROAD',
          description: undefined,
          isApproved: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          user: undefined,
          vehiclesCount: 0,
        } satisfies CarrierProfile
      }

      const payload = await requestJson<unknown>(
        '/carrier/profile',
        { method: 'GET' },
        { auth: true },
      )

      return mapCarrierProfile(payload)
    },
  },

  vehicles: {
    getVehicles: async () => {
      if (!isUsingLiveApi()) {
        return [] as CarrierVehicle[]
      }

      const payload = await requestJson<unknown>(
        '/vehicles',
        { method: 'GET' },
        { auth: true },
      )

      return mapVehiclesList(payload)
    },
  },
}
