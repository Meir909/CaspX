import type {
  CalculatedRoute,
  CarrierProfile,
  CarrierVehicle,
  CheckpointLoadCurrentSnapshot,
  CheckpointLoadItem,
  LogisticsPrediction,
  Order,
  TrackingEvent,
  TrackingTimeline,
} from '@/types'
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

type CreateOrderInput = Partial<Order> & {
  from: string
  to: string
  fromCountry?: string
  toCountry?: string
  cargoType: string
  weight: string | number
  volume: string | number
  date: string
  cargoImageFiles?: File[]
}

type UpdateOrderInput = Partial<{
  from: string
  to: string
  fromCountry: string
  toCountry: string
  originLat: number
  originLng: number
  destinationLat: number
  destinationLng: number
  cargoType: string
  weight: string | number
  volume: string | number
  comment: string
  cargoImages: string[]
  status: Order['status']
}>

type UpsertVehicleInput = {
  type: string
  brand: string
  model: string
  year: number | string
  plateNumber: string
  capacityTons: number | string
  cargoVolume: number | string
  vehicleImageUrl?: string
}

type UpdateCarrierProfileInput = Partial<{
  experienceYears: number | string
  transportType: string
  description: string
}>

type UploadAvatarResult = {
  url: string
  user?: unknown
}

type UploadOrderMediaResult = {
  url: string
  order?: unknown
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

function readNullableNumber(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) return parsed
    }
  }

  return undefined
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

function toBackendStatus(status: Order['status']) {
  switch (status) {
    case 'created':
      return 'NEW'
    case 'searching':
      return 'SEARCHING'
    case 'assigned':
      return 'ASSIGNED'
    case 'in_progress':
      return 'IN_TRANSIT'
    case 'delivered':
      return 'DELIVERED'
    case 'cancelled':
      return 'CANCELLED'
    default:
      return 'SEARCHING'
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

function assertLiveApi() {
  if (!isUsingLiveApi()) {
    throw new Error('Live API недоступен. В приложении отключены демо-подмены, поэтому нужен рабочий backend.')
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
  const carrierName =
    [
      readString(data, ['carrierFirstName']),
      readString(data, ['carrierLastName']),
    ]
      .filter(Boolean)
      .join(' ')
      .trim() || undefined

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
    carrierName,
    carrierEmail: readNullableString(data, ['carrierEmail']),
    originLat: readNullableNumber(data, ['originLat']),
    originLng: readNullableNumber(data, ['originLng']),
    destinationLat: readNullableNumber(data, ['destinationLat']),
    destinationLng: readNullableNumber(data, ['destinationLng']),
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

function mapTrackingEvent(payload: unknown): TrackingEvent {
  const data = isPlainObject(payload) ? payload : {}

  return {
    id: readString(data, ['id'], crypto.randomUUID()),
    orderId: readString(data, ['orderId']),
    status: toFrontendStatus(readString(data, ['status'], 'SEARCHING')),
    location: readNullableString(data, ['location']),
    timestamp: readString(data, ['timestamp', 'createdAt'], new Date().toISOString()),
    createdAt: readString(data, ['createdAt', 'timestamp'], new Date().toISOString()),
  }
}

function mapTrackingTimeline(payload: unknown): TrackingTimeline {
  const data = isPlainObject(payload) ? payload : {}

  return {
    orderId: readString(data, ['orderId']),
    currentStatus: toFrontendStatus(readString(data, ['currentStatus'], 'SEARCHING')),
    tracking: asArray(data.tracking).map((item) => mapTrackingEvent(item)),
  }
}

function mapCalculatedRoute(payload: unknown): CalculatedRoute {
  const data = isPlainObject(payload) ? payload : {}
  const geometry = isPlainObject(data.geometry) ? data.geometry : {}

  return {
    routeId: readNullableString(data, ['routeId']),
    orderId: readNullableString(data, ['orderId']),
    distanceKm: readNumber(data, ['distanceKm'], 0),
    durationMinutes: readNumber(data, ['durationMinutes'], 0),
    geometry: {
      type: readString(geometry, ['type'], 'LineString'),
      coordinates: asArray(geometry.coordinates)
        .map((point) => {
          if (!Array.isArray(point) || point.length < 2) return null
          const lng = typeof point[0] === 'number' ? point[0] : Number(point[0])
          const lat = typeof point[1] === 'number' ? point[1] : Number(point[1])
          if (Number.isNaN(lng) || Number.isNaN(lat)) return null
          return [lng, lat] as [number, number]
        })
        .filter((point): point is [number, number] => Boolean(point)),
    },
  }
}

function mapCheckpointLoadItem(payload: unknown): CheckpointLoadItem {
  const data = isPlainObject(payload) ? payload : {}

  return {
    checkpointName: readString(data, ['checkpointName'], 'Checkpoint'),
    borderCountry: readNullableString(data, ['borderCountry']),
    region: readNullableString(data, ['region']),
    waitingAreaCount: readNumber(data, ['waitingAreaCount'], 0),
    activeTruckNumbers: readStringArray(data, ['activeTruckNumbers']),
    entryTimes: readStringArray(data, ['entryTimes']),
    source: readString(data, ['source'], 'backend'),
  }
}

function mapCheckpointLoadsSnapshot(payload: unknown): CheckpointLoadCurrentSnapshot {
  const data = isPlainObject(payload) ? payload : {}

  return {
    syncBatchId: readString(data, ['syncBatchId'], ''),
    fetchedAt: readString(data, ['fetchedAt'], new Date().toISOString()),
    checkpoints: asArray(data.checkpoints).map((item) => mapCheckpointLoadItem(item)),
  }
}

function mapPrediction(payload: unknown): LogisticsPrediction {
  const data = isPlainObject(payload) ? payload : {}

  return {
    orderId: readNullableString(data, ['orderId']),
    recommendation: readString(data, ['recommendation'], 'wait'),
    riskLevel: readString(data, ['riskLevel'], 'medium'),
    bestDepartureTime: readString(data, ['bestDepartureTime'], new Date().toISOString()),
    expectedDelayMinutes: readNumber(data, ['expectedDelayMinutes'], 0),
    shortExplanation: readString(data, ['shortExplanation'], 'Prediction is not available.'),
  }
}

function buildOrderPayload(data: CreateOrderInput | UpdateOrderInput) {
  const payload: Record<string, unknown> = {}
  const hasRoute = typeof data.from === 'string' || typeof data.to === 'string'

  if (hasRoute) {
    const originCity = typeof data.from === 'string' ? data.from : undefined
    const destinationCity = typeof data.to === 'string' ? data.to : undefined
    const originCountry = data.fromCountry
    const destinationCountry = data.toCountry

    if (originCity) payload.originCity = originCity
    if (destinationCity) payload.destinationCity = destinationCity
    if (originCountry) payload.originCountry = originCountry
    if (destinationCountry) payload.destinationCountry = destinationCountry
    if (originCity || originCountry) {
      payload.origin = [originCountry, originCity].filter(Boolean).join(', ')
    }
    if (destinationCity || destinationCountry) {
      payload.destination = [destinationCountry, destinationCity].filter(Boolean).join(', ')
    }
  }

  if (typeof data.originLat === 'number' && Number.isFinite(data.originLat)) {
    payload.originLat = data.originLat
  }

  if (typeof data.originLng === 'number' && Number.isFinite(data.originLng)) {
    payload.originLng = data.originLng
  }

  if (typeof data.destinationLat === 'number' && Number.isFinite(data.destinationLat)) {
    payload.destinationLat = data.destinationLat
  }

  if (typeof data.destinationLng === 'number' && Number.isFinite(data.destinationLng)) {
    payload.destinationLng = data.destinationLng
  }

  if (typeof data.cargoType === 'string' && data.cargoType.trim()) {
    payload.cargoType = data.cargoType.trim()
  }

  if (data.weight !== undefined) {
    payload.weight = Number(data.weight)
  }

  if (data.volume !== undefined) {
    payload.volume = Number(data.volume)
  }

  if (typeof data.comment === 'string') {
    payload.comment = data.comment.trim() || undefined
  }

  if (data.status) {
    payload.status = toBackendStatus(data.status)
  }

  if (payload.cargoType && (payload.origin || payload.destination)) {
    payload.title = `${payload.cargoType}: ${payload.origin || ''} -> ${payload.destination || ''}`.trim()
  }

  return payload
}

function buildVehiclePayload(data: UpsertVehicleInput) {
  return {
    type: data.type.trim(),
    brand: data.brand.trim(),
    model: data.model.trim(),
    year: Number(data.year),
    plateNumber: data.plateNumber.trim(),
    capacityTons: Number(data.capacityTons),
    cargoVolume: Number(data.cargoVolume),
    vehicleImageUrl: data.vehicleImageUrl || undefined,
  }
}

function createUploadBody(file: File, extraFields: Record<string, string> = {}) {
  const formData = new FormData()

  Object.entries(extraFields).forEach(([key, value]) => {
    formData.append(key, value)
  })

  formData.append('file', file)
  return formData
}

export const backendApi = {
  orders: {
    getOrders: async () => {
      assertLiveApi()

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
      assertLiveApi()

      const payload = await requestJson<unknown>(
        `/orders/${id}`,
        { method: 'GET' },
        { auth: true },
      )

      return mapOrder(payload)
    },

    createOrder: async (data: CreateOrderInput) => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        '/orders',
        {
          method: 'POST',
          body: JSON.stringify(buildOrderPayload(data)),
        },
        { auth: true },
      )

      const createdOrder = mapOrder(payload)

      if (!data.cargoImageFiles?.length) {
        return createdOrder
      }

      const [cargoFile, ...productFiles] = data.cargoImageFiles

      await requestJson<UploadOrderMediaResult>(
        '/uploads/cargo',
        {
          method: 'POST',
          body: createUploadBody(cargoFile, { orderId: createdOrder.id }),
        },
        { auth: true },
      )

      await Promise.all(
        productFiles.map((file) =>
          requestJson<UploadOrderMediaResult>(
            '/uploads/product',
            {
              method: 'POST',
              body: createUploadBody(file, { orderId: createdOrder.id }),
            },
            { auth: true },
          ),
        ),
      )

      const refreshed = await requestJson<unknown>(
        `/orders/${createdOrder.id}`,
        { method: 'GET' },
        { auth: true },
      )

      return mapOrder(refreshed)
    },

    getAvailableOrders: async () => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        '/orders/available',
        { method: 'GET' },
        { auth: true },
      )

      return mapOrdersList(payload)
    },

    assignOrder: async (id: string) => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        `/orders/${id}/assign`,
        { method: 'POST' },
        { auth: true },
      )

      return mapOrder(payload)
    },

    updateOrder: async (id: string, data: UpdateOrderInput) => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        `/orders/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(buildOrderPayload(data)),
        },
        { auth: true },
      )

      return mapOrder(payload)
    },
  },

  carrier: {
    getProfile: async () => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        '/carrier/profile',
        { method: 'GET' },
        { auth: true },
      )

      return mapCarrierProfile(payload)
    },

    updateProfile: async (data: UpdateCarrierProfileInput) => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        '/carrier/profile',
        {
          method: 'PATCH',
          body: JSON.stringify({
            experienceYears: data.experienceYears !== undefined ? Number(data.experienceYears) : undefined,
            transportType: data.transportType?.trim() || undefined,
            description: data.description?.trim() || undefined,
          }),
        },
        { auth: true },
      )

      return mapCarrierProfile(payload)
    },
  },

  vehicles: {
    getVehicles: async () => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        '/vehicles',
        { method: 'GET' },
        { auth: true },
      )

      return mapVehiclesList(payload)
    },

    createVehicle: async (data: UpsertVehicleInput) => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        '/vehicles',
        {
          method: 'POST',
          body: JSON.stringify(buildVehiclePayload(data)),
        },
        { auth: true },
      )

      return mapVehicle(payload)
    },

    updateVehicle: async (id: string, data: Partial<UpsertVehicleInput>) => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        `/vehicles/${id}`,
        {
          method: 'PATCH',
          body: JSON.stringify(buildVehiclePayload({
            type: data.type || 'TRUCK',
            brand: data.brand || '',
            model: data.model || '',
            year: data.year || new Date().getFullYear(),
            plateNumber: data.plateNumber || '',
            capacityTons: data.capacityTons || 0,
            cargoVolume: data.cargoVolume || 0,
            vehicleImageUrl: data.vehicleImageUrl,
          })),
        },
        { auth: true },
      )

      return mapVehicle(payload)
    },
  },

  tracking: {
    getTimeline: async (orderId: string) => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        `/orders/${orderId}/tracking`,
        { method: 'GET' },
        { auth: true },
      )

      return mapTrackingTimeline(payload)
    },
  },

  routes: {
    calculate: async (orderId: string) => {
      assertLiveApi()

      const payload = await requestJson<unknown>(
        '/routes/calculate',
        {
          method: 'POST',
          body: JSON.stringify({ orderId }),
        },
        { auth: true },
      )

      return mapCalculatedRoute(payload)
    },
  },

  checkpointLoads: {
    getCurrent: async () => {
      const payload = await requestJson<unknown>(
        '/checkpoint-loads/current',
        { method: 'GET' },
      )

      return mapCheckpointLoadsSnapshot(payload)
    },
  },

  predictions: {
    predictLand: async (orderId: string) => {
      const payload = await requestJson<unknown>(
        '/predictions/land',
        {
          method: 'POST',
          body: JSON.stringify({ orderId }),
        },
      )

      return mapPrediction(payload)
    },

    predictMarine: async (input: {
      originLat: number
      originLng: number
      destLat: number
      destLng: number
    }) => {
      const payload = await requestJson<unknown>(
        '/predictions/marine',
        {
          method: 'POST',
          body: JSON.stringify(input),
        },
      )

      return mapPrediction(payload)
    },
  },

  uploads: {
    uploadAvatar: async (file: File) => {
      assertLiveApi()

      return requestJson<UploadAvatarResult>(
        '/uploads/avatar',
        {
          method: 'POST',
          body: createUploadBody(file),
        },
        { auth: true },
      )
    },
  },
}
