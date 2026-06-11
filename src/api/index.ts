import type {
  Carrier,
  Chat,
  Checkpoint,
  Message,
  Notification,
  Order,
  Port,
  Route,
  Truck,
  User,
  UserRole,
  Vessel,
} from '@/types'
import {
  aiRoute,
  analyticsSeries,
  appUser,
  carriers as seedCarriers,
  chats as seedChats,
  checkpointLoads,
  notifications as seedNotifications,
  orders as seedOrders,
  portLoads,
  stats,
} from '@/data/mock'
import {
  clearSessionTokens,
  getAccessToken,
  getApiBaseUrl,
  getRefreshToken,
  isLiveApiEnabled,
  setSessionTokens,
} from '@/lib/session'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let currentUser: User = appUser
let ordersDb: Order[] = [...seedOrders]
let carriersDb: Carrier[] = [...seedCarriers]
let notificationsDb: Notification[] = [...seedNotifications]
let chatsDb: Chat[] = [...seedChats]
let messagesDb: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'message-1',
      senderId: 'carrier-1',
      text: 'Здравствуйте! Мы можем забрать груз сегодня после 18:00.',
      createdAt: '2026-06-15T10:30:00.000Z',
    },
    {
      id: 'message-2',
      senderId: 'user-1',
      text: 'Отлично, подтвердите время подачи на терминал.',
      createdAt: '2026-06-15T10:31:00.000Z',
    },
  ],
  'chat-2': [
    {
      id: 'message-3',
      senderId: 'ai-assistant',
      text: 'Здравствуйте! Я ваш AI-помощник по логистике. Чем могу помочь?',
      createdAt: '2026-06-15T10:29:00.000Z',
    },
    {
      id: 'message-4',
      senderId: 'user-1',
      text: 'Какой маршрут быстрее из Актау в Баку?',
      createdAt: '2026-06-15T10:30:00.000Z',
    },
    {
      id: 'message-5',
      senderId: 'ai-assistant',
      text: 'Оптимальный маршрут: Актау -> Курык -> Баку. Расстояние 740 км, время в пути 12 часов.',
      createdAt: '2026-06-15T10:31:00.000Z',
    },
  ],
}

const portsDb: Port[] = portLoads.map((point, index) => ({
  id: point.id,
  name: point.name,
  location:
    index === 0
      ? { lat: 43.635, lng: 51.168 }
      : index === 1
        ? { lat: 43.18, lng: 51.68 }
        : { lat: 44.54, lng: 50.24 },
  load: point.value,
}))

const checkpointsDb: Checkpoint[] = checkpointLoads.map((point, index) => ({
  id: point.id,
  name: point.name,
  location:
    index === 0
      ? { lat: 43.27, lng: 51.15 }
      : index === 1
        ? { lat: 40.5, lng: 52.72 }
        : { lat: 42.74, lng: 55.38 },
  load: point.value,
}))

const vesselsDb: Vessel[] = [
  { id: 'vessel-1', name: 'Caspian Star', location: { lat: 42.6, lng: 50.8 }, status: 'В пути' },
  { id: 'vessel-2', name: 'Aktau Express', location: { lat: 41.9, lng: 50.2 }, status: 'Ожидание' },
]

const trucksDb: Truck[] = [
  { id: 'truck-1', name: 'KZ 123 AB 12', location: { lat: 43.45, lng: 51.11 }, status: 'На линии' },
  { id: 'truck-2', name: 'KZ 456 CD 13', location: { lat: 42.95, lng: 51.74 }, status: 'В рейсе' },
]

type CreateOrderPayload = Partial<Order> & {
  from: string
  to: string
  fromCountry?: string
  toCountry?: string
  cargoType: string
  weight: string | number
  volume: string | number
  date: string
}

type BecomeCarrierPayload = {
  company?: string
  businessId?: string
  direction?: string
  capacity?: string
  experience?: string
  volume?: string
  plate?: string
  transportType?: string
  transportImage?: string
}

type SessionTokens = {
  accessToken: string
  refreshToken: string
}

type RequestOptions = {
  auth?: boolean
  retryOnAuth?: boolean
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

function extractErrorMessage(payload: unknown, fallback: string) {
  if (typeof payload === 'string' && payload.trim()) return payload
  if (!isPlainObject(payload)) return fallback

  const message = payload.message
  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message)) {
    const parts = message.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    )
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

function toUserRole(role: string, carrierApproved: boolean): UserRole {
  const normalized = role.toLowerCase()

  if (normalized.includes('akimat')) return 'akimat'
  if (normalized.includes('admin')) return 'admin'
  if (normalized.includes('carrier') || carrierApproved) return 'carrier'
  return 'user'
}

function toCarrierStatus(isApproved: boolean | undefined, role: UserRole): User['carrierStatus'] {
  if (role !== 'carrier' && typeof isApproved !== 'boolean') return undefined
  if (isApproved) return 'approved'
  return 'pending'
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
    rating: readNumber(data, ['rating'], currentUser.rating ?? 4.8),
    carrierStatus: toCarrierStatus(isApproved, role),
  }
}

function mapCarrierProfile(payload: unknown): Carrier {
  const data = getEnvelope(payload, 'carrierProfile') ?? {}
  const nestedUser = isPlainObject(data.user) ? data.user : {}
  const name = [
    readString(nestedUser, ['firstName', 'first_name']),
    readString(nestedUser, ['lastName', 'last_name']),
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || readString(nestedUser, ['name'], currentUser.name)

  return {
    id: readString(data, ['id', 'carrierId', 'userId'], currentUser.id),
    name,
    company: readNullableString(nestedUser, ['company', 'companyName']) || currentUser.company,
    rating: readNumber(data, ['rating'], currentUser.rating ?? 4.8),
    experience: readNumber(data, ['experienceYears', 'experience'], 0),
    price: readNumber(data, ['estimatedPrice', 'price'], 0),
    transport: readString(data, ['transportType', 'type'], 'TRUCK'),
    avatar: readNullableString(nestedUser, ['avatar', 'avatarUrl']),
    etaLabel: undefined,
    capacityLabel: undefined,
    volumeLabel: undefined,
    badge: readBoolean(data, ['isApproved'], false) ? 'Подтвержден' : 'На проверке',
    phone: readNullableString(nestedUser, ['phone', 'phoneNumber']) || currentUser.phone,
    transportImage: readNullableString(data, ['vehicleImageUrl']),
    vehiclePlate: readNullableString(data, ['plateNumber', 'vehiclePlate']),
  }
}

function mapBackendOrder(payload: unknown): Order {
  const data = getEnvelope(payload, 'order') ?? {}
  const originRaw = readString(data, ['origin'], 'Маршрут не указан')
  const destinationRaw = readString(data, ['destination'], 'Маршрут не указан')
  const origin = splitPoint(originRaw)
  const destination = splitPoint(destinationRaw)
  const createdAt = readString(data, ['createdAt', 'updatedAt'], new Date().toISOString())
  const deliveryTimeHours = readNumber(data, ['estimatedDeliveryTime'], 72)
  const estimatedPrice = readNumber(data, ['estimatedPrice'], 0)

  return {
    id: readString(data, ['id'], `${Date.now()}`),
    number: readString(data, ['number', 'orderNumber'], readString(data, ['id'], '')),
    from: origin.city,
    fromCountry: origin.country,
    fromRegion: origin.country,
    to: destination.city,
    toCountry: destination.country,
    toRegion: destination.country,
    cargoType: readString(data, ['cargoType'], 'Cargo'),
    weight: readNumber(data, ['weight'], 0),
    volume: readNumber(data, ['volume'], 0),
    places: readNumber(data, ['places'], 1),
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
      { title: origin.city, subtitle: origin.country || 'Пункт отправки', color: 'blue' },
      { title: destination.city, subtitle: destination.country || 'Пункт доставки', color: 'violet' },
    ],
    trackingEvents: [
      { time: 'Сейчас', title: 'Заказ получен от backend', location: originRaw },
      { time: 'Ожидается', title: 'Ожидание realtime tracking', location: destinationRaw },
    ],
    cargoImages: [],
    progressLabel: '0 км',
    remainingLabel: `${deliveryTimeHours} ч`,
    speedLabel: 'Ожидание',
  }
}

function mapOrdersList(payload: unknown): Order[] {
  if (!isPlainObject(payload)) return []
  return asArray(payload.orders).map((item) => mapBackendOrder({ order: item }))
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

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options: RequestOptions = {},
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
  const payload = raw ? (JSON.parse(raw) as unknown) : null

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

function mapTransportType(value: string) {
  const normalized = value.toLowerCase()
  if (normalized.includes('sea') || normalized.includes('мор')) return 'SEA'
  if (normalized.includes('multi') || normalized.includes('мульт')) return 'MULTIMODAL'
  return 'ROAD'
}

function isUsingLiveApi() {
  return isLiveApiEnabled()
}

async function mockLogin(email: string): Promise<User> {
  await delay(300)
  currentUser = { ...currentUser, email }
  return currentUser
}

async function mockRegister(data: Partial<User> & { password?: string }): Promise<User> {
  await delay(400)
  currentUser = {
    ...appUser,
    name: data.name || appUser.name,
    email: data.email || appUser.email,
    phone: data.phone || appUser.phone,
  }
  return currentUser
}

async function mockBecomeCarrier(data: BecomeCarrierPayload): Promise<User> {
  await delay(600)

  currentUser = {
    ...currentUser,
    company: data.company || currentUser.company,
    carrierStatus: 'approved',
    role: 'carrier',
  }

  const carrierId = currentUser.id
  const newCarrier: Carrier = {
    id: carrierId,
    name: currentUser.name,
    company: data.company || currentUser.company,
    rating: currentUser.rating || 4.7,
    experience: Number.parseInt(data.experience || '3', 10),
    price: 2100000,
    transport: data.transportType || 'Тентовый',
    etaLabel: '2-4 дня',
    capacityLabel: `${data.capacity || '20'} т`,
    volumeLabel: `${data.volume || '82'} м3`,
    badge: 'Новый',
    phone: currentUser.phone,
    transportImage: data.transportImage,
    vehiclePlate: data.plate || 'KZ 000 AA 00',
  }

  const exists = carriersDb.some((carrier) => carrier.id === carrierId)
  carriersDb = exists
    ? carriersDb.map((carrier) => (carrier.id === carrierId ? { ...carrier, ...newCarrier } : carrier))
    : [newCarrier, ...carriersDb]

  return currentUser
}

async function mockGetOrders() {
  await delay(300)
  return [...ordersDb]
}

async function mockGetOrder(id: string) {
  await delay(200)
  return ordersDb.find((order) => order.id === id)
}

async function mockCreateOrder(data: CreateOrderPayload): Promise<Order> {
  await delay(500)

  const carrier = carriersDb[0]
  const order: Order = {
    id: `${Date.now()}`,
    number: `${new Date().getFullYear()}${String(ordersDb.length + 1).padStart(3, '0')}`,
    from: data.from,
    fromCountry: data.fromCountry,
    fromRegion: data.fromCountry,
    to: data.to,
    toCountry: data.toCountry,
    toRegion: data.toCountry,
    cargoType: data.cargoType,
    weight: Number(data.weight),
    volume: Number(data.volume),
    places: 20,
    pickupDate: data.date,
    deliveryDate: new Date(new Date(data.date).getTime() + 72 * 60 * 60 * 1000).toISOString(),
    price: carrier.price,
    status: 'searching',
    createdAt: new Date().toISOString(),
    transportType: 'Тентовый',
    comment: data.comment,
    requirements: data.requirements ?? [],
    notes: 'Заказ создан через CaspX.',
    carrierId: carrier.id,
    cargoImages: data.cargoImages ?? [],
    routeStops: [
      { title: data.from, subtitle: data.fromCountry || 'Страна отправления', color: 'blue' },
      { title: 'Курык', subtitle: 'Промежуточный порт', color: 'amber' },
      { title: data.to, subtitle: data.toCountry || 'Страна назначения', color: 'violet' },
    ],
    trackingEvents: [
      { time: 'Сейчас', title: 'Заказ создан', location: `${data.from}, ${data.fromCountry || ''}`.trim() },
      { time: 'Ожидается', title: 'Подбор перевозчика', location: 'CaspX' },
    ],
    progressLabel: '0 км',
    remainingLabel: '740 км',
    speedLabel: 'Ожидание',
  }

  ordersDb = [order, ...ordersDb]
  notificationsDb = [
    {
      id: `notification-${Date.now()}`,
      type: 'order_updated',
      title: 'Создан новый заказ',
      message: `Заказ №${order.number} успешно создан и отправлен на подбор перевозчика.`,
      read: false,
      createdAt: new Date().toISOString(),
    },
    ...notificationsDb,
  ]

  return order
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      if (!isUsingLiveApi()) {
        return mockLogin(email)
      }

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
      if (!isUsingLiveApi()) {
        return mockRegister(data)
      }

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
          }),
        },
      )

      if (!data.email || !data.password) {
        throw new Error('Регистрация прошла, но не хватает email/password для автоматического входа.')
      }

      return api.auth.login(data.email, data.password)
    },

    forgotPassword: async (_email: string): Promise<void> => {
      await delay(400)
    },

    logout: async (): Promise<void> => {
      if (!isUsingLiveApi()) {
        clearSessionTokens()
        return
      }

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
      if (!isUsingLiveApi()) {
        await delay(200)
        return currentUser
      }

      const payload = await requestJson<unknown>(
        '/auth/me',
        {
          method: 'GET',
        },
        { auth: true },
      )

      const user = mapBackendUser(payload)
      currentUser = user
      return user
    },

    becomeCarrier: async (data: BecomeCarrierPayload): Promise<User> => {
      if (!isUsingLiveApi()) {
        return mockBecomeCarrier(data)
      }

      const payload = await requestJson<unknown>(
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

      const profile = mapCarrierProfile(payload)
      currentUser = {
        ...currentUser,
        role: 'carrier',
        company: data.company || profile.company || currentUser.company,
        carrierStatus: profile.badge === 'Подтвержден' ? 'approved' : 'pending',
      }

      const exists = carriersDb.some((carrier) => carrier.id === profile.id)
      carriersDb = exists
        ? carriersDb.map((carrier) => (carrier.id === profile.id ? { ...carrier, ...profile } : carrier))
        : [profile, ...carriersDb]

      return currentUser
    },
  },

  orders: {
    getOrders: async (): Promise<Order[]> => {
      if (!isUsingLiveApi()) {
        return mockGetOrders()
      }

      try {
        const payload = await requestJson<unknown>(
          '/orders/my',
          {
            method: 'GET',
          },
          { auth: true },
        )
        return mapOrdersList(payload)
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
          const fallbackPayload = await requestJson<unknown>(
            '/orders',
            {
              method: 'GET',
            },
            { auth: true },
          )
          return mapOrdersList(fallbackPayload)
        }
        throw error
      }
    },

    getOrder: async (id: string): Promise<Order | undefined> => {
      if (!isUsingLiveApi()) {
        return mockGetOrder(id)
      }

      const payload = await requestJson<unknown>(
        `/orders/${id}`,
        {
          method: 'GET',
        },
        { auth: true },
      )

      return mapBackendOrder(payload)
    },

    createOrder: async (data: CreateOrderPayload): Promise<Order> => {
      if (!isUsingLiveApi()) {
        return mockCreateOrder(data)
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
            destination,
            comment: data.comment || undefined,
          }),
        },
        { auth: true },
      )

      return mapBackendOrder(payload)
    },

    getCarriers: async (): Promise<Carrier[]> => {
      await delay(300)
      return [...carriersDb]
    },

    getCarrier: async (id: string): Promise<Carrier | undefined> => {
      await delay(200)
      return carriersDb.find((carrier) => carrier.id === id)
    },
  },

  map: {
    getPorts: async (): Promise<Port[]> => {
      await delay(200)
      return [...portsDb]
    },
    getCheckpoints: async (): Promise<Checkpoint[]> => {
      await delay(200)
      return [...checkpointsDb]
    },
    getVessels: async (): Promise<Vessel[]> => {
      await delay(200)
      return [...vesselsDb]
    },
    getTrucks: async (): Promise<Truck[]> => {
      await delay(200)
      return [...trucksDb]
    },
  },

  ai: {
    chat: async (message: string): Promise<string> => {
      await delay(500)
      if (/границ|кпп|курык/i.test(message)) {
        return 'На пограничном переходе Курык загруженность средняя. Ожидание 2-4 часа, рекомендуем выезд после 18:00.'
      }

      if (/маршрут|актау|баку/i.test(message)) {
        return 'Оптимальный маршрут: Актау -> Курык -> Баку. Время в пути около 12 часов, стоимость от 2 150 000 т.'
      }

      return 'Готов помочь с маршрутом, загрузкой портов, подбором перевозчика и ETA по заказам.'
    },
    generateRoute: async (_from: string, _to: string): Promise<Route> => {
      await delay(500)
      return aiRoute
    },
    getAnalytics: async () => {
      await delay(300)
      return analyticsSeries
    },
  },

  chat: {
    getChats: async (): Promise<Chat[]> => {
      await delay(200)
      return [...chatsDb]
    },
    getMessages: async (chatId: string): Promise<Message[]> => {
      await delay(200)
      return [...(messagesDb[chatId] ?? [])]
    },
    sendMessage: async (chatId: string, text: string): Promise<Message> => {
      await delay(150)
      const message: Message = {
        id: `${Date.now()}`,
        senderId: 'user-1',
        text,
        createdAt: new Date().toISOString(),
      }

      const response: Message = {
        id: `${Date.now() + 1}`,
        senderId: chatId === 'chat-2' ? 'ai-assistant' : 'carrier-1',
        text:
          chatId === 'chat-2'
            ? 'Принял запрос. Подготовил обновленную рекомендацию по маршруту и времени выезда.'
            : 'Подтверждаем, машина будет на месте в указанный слот.',
        createdAt: new Date(Date.now() + 60_000).toISOString(),
      }

      messagesDb = {
        ...messagesDb,
        [chatId]: [...(messagesDb[chatId] ?? []), message, response],
      }

      chatsDb = chatsDb.map((chat) =>
        chat.id === chatId ? { ...chat, lastMessage: response.text, unreadCount: 0 } : chat,
      )

      return message
    },
  },

  notifications: {
    getNotifications: async (): Promise<Notification[]> => {
      await delay(150)
      return [...notificationsDb]
    },
  },

  stats: {
    getStats: async () => {
      await delay(150)
      return stats
    },
    getCharts: async () => {
      await delay(150)
      return analyticsSeries
    },
  },
}
