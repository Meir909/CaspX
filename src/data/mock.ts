import type { Carrier, Chat, Message, Notification, Order, Route, User } from '@/types'

export interface RouteStop {
  title: string
  subtitle: string
  color: 'blue' | 'violet' | 'amber' | 'green' | 'red'
}

export interface TrackingEvent {
  time: string
  title: string
  location: string
}

export interface Vehicle {
  id: string
  name: string
  type: string
  capacity: string
  volume: string
  plate: string
  status: 'active' | 'service' | 'standby'
  location: string
}

export interface SupportItem {
  id: string
  title: string
  description: string
  icon: 'help' | 'chat' | 'alert' | 'phone'
}

export interface SettingsItem {
  id: string
  label: string
  value: string
}

export interface LoadPoint {
  id: string
  name: string
  value: number
  level: 'low' | 'medium' | 'high'
}

export interface MapNode {
  id: string
  label: string
  x: number
  y: number
  status?: 'low' | 'medium' | 'high'
}

export interface TimelineRoute {
  id: string
  from: string
  to: string
  status: 'active' | 'warning' | 'critical'
}

export interface LocationCountry {
  country: string
  cities: string[]
}

export const locationCatalog: LocationCountry[] = [
  { country: 'Казахстан', cities: ['Актау', 'Курык', 'Астана', 'Алматы'] },
  { country: 'Азербайджан', cities: ['Баку', 'Сумгаит', 'Гянджа'] },
  { country: 'Турция', cities: ['Стамбул', 'Анкара', 'Измир'] },
  { country: 'Грузия', cities: ['Тбилиси', 'Батуми', 'Поти'] },
  { country: 'Узбекистан', cities: ['Ташкент', 'Самарканд', 'Бухара'] },
  { country: 'Туркменистан', cities: ['Туркменбаши', 'Ашхабад', 'Туркменабад'] },
  { country: 'Германия', cities: ['Берлин', 'Гамбург', 'Мюнхен'] },
  { country: 'Польша', cities: ['Варшава', 'Гданьск', 'Краков'] },
  { country: 'Италия', cities: ['Рим', 'Милан', 'Генуя'] },
  { country: 'Нидерланды', cities: ['Роттердам', 'Амстердам', 'Гаага'] },
]

export const cargoSuggestions = ['Металл', 'Оборудование', 'Контейнеры', 'Продукты', 'Текстиль']

export const appUser: User = {
  id: 'user-1',
  name: 'Алишер А.',
  email: 'alisher@caspx.kz',
  phone: '+7 701 123 45 67',
  role: 'user',
  rating: 4.8,
  company: 'TOO Caspian Logistics',
  carrierStatus: 'approved',
  location: 'Актау, Казахстан',
}

export const carriers: Carrier[] = [
  {
    id: 'carrier-1',
    name: 'Caspian Logistics',
    company: 'Caspian Logistics',
    rating: 4.8,
    experience: 8,
    price: 2150000,
    transport: 'Тентовый',
    etaLabel: '2-3 дня',
    capacityLabel: '20 т',
    volumeLabel: '82 м³',
    badge: 'Проверен',
    phone: '+7 701 456 78 90',
    vehiclePlate: 'KZ 123 AB 12',
  },
  {
    id: 'carrier-2',
    name: 'West Trans KZ',
    company: 'West Trans KZ',
    rating: 4.6,
    experience: 6,
    price: 2200000,
    transport: 'Контейнеровоз',
    etaLabel: '2-3 дня',
    capacityLabel: '20 т',
    volumeLabel: '82 м³',
    badge: 'Надежный',
    phone: '+7 777 123 00 11',
    vehiclePlate: 'KZ 456 CD 13',
  },
  {
    id: 'carrier-3',
    name: 'Aktau Transport',
    company: 'Aktau Transport',
    rating: 4.7,
    experience: 5,
    price: 2300000,
    transport: 'Рефрижератор',
    etaLabel: '3-4 дня',
    capacityLabel: '18 т',
    volumeLabel: '75 м³',
    badge: 'Популярный',
    phone: '+7 702 111 22 33',
    vehiclePlate: 'KZ 789 GH 56',
  },
  {
    id: 'carrier-4',
    name: 'Global Shipping',
    company: 'Global Shipping',
    rating: 4.5,
    experience: 9,
    price: 2450000,
    transport: 'Тентовый',
    etaLabel: '3-4 дня',
    capacityLabel: '20 т',
    volumeLabel: '82 м³',
    badge: 'Проверен',
    phone: '+7 701 222 33 44',
    vehiclePlate: 'KZ 159 EF 02',
  },
]

export const orders: Order[] = [
  {
    id: '240615-001',
    number: '240615-001',
    from: 'Актау',
    fromCountry: 'Казахстан',
    fromRegion: 'Мангистауская область',
    to: 'Баку',
    toCountry: 'Азербайджан',
    toRegion: 'Азербайджан',
    cargoType: 'Металл',
    weight: 40,
    volume: 82,
    places: 20,
    pickupDate: '2026-06-15',
    deliveryDate: '2026-06-18T18:00:00.000Z',
    price: 2150000,
    status: 'in_progress',
    createdAt: '2026-06-15T10:30:00.000Z',
    transportType: 'Тентовый',
    requirements: ['Требуется погрузка', 'Контроль пломбы'],
    carrierId: 'carrier-1',
    notes: 'Загрузка до 12:00. Документы готовы.',
    routeStops: [
      { title: 'Актау', subtitle: 'Казахстан', color: 'blue' },
      { title: 'Курык', subtitle: 'Промежуточная точка', color: 'amber' },
      { title: 'Баку', subtitle: 'Азербайджан', color: 'violet' },
    ],
    trackingEvents: [
      { time: '15 июн 09:00', title: 'Загружено в Актау', location: 'Порт Актау' },
      { time: '15 июн 11:30', title: 'В пути', location: 'Каспийское море' },
      { time: '18 июн 10:00', title: 'Ожидается доставка', location: 'Баку, порт' },
    ],
    progressLabel: '320 км',
    remainingLabel: '420 км',
    speedLabel: '72 км/ч',
    cargoImages: [],
  },
  {
    id: '240610-045',
    number: '240610-045',
    from: 'Актау',
    fromCountry: 'Казахстан',
    fromRegion: 'Мангистауская область',
    to: 'Туркменбаши',
    toCountry: 'Туркменистан',
    toRegion: 'Туркменистан',
    cargoType: 'Контейнеры',
    weight: 20,
    volume: 60,
    places: 12,
    pickupDate: '2026-06-12',
    deliveryDate: '2026-06-17T18:00:00.000Z',
    price: 1250000,
    status: 'searching',
    createdAt: '2026-06-10T08:00:00.000Z',
    transportType: 'Контейнеровоз',
    requirements: ['Требуется кран'],
    carrierId: 'carrier-2',
    notes: 'Подача машины утром.',
    routeStops: [
      { title: 'Актау', subtitle: 'Казахстан', color: 'blue' },
      { title: 'Курык', subtitle: 'Порт', color: 'amber' },
      { title: 'Туркменбаши', subtitle: 'Туркменистан', color: 'green' },
    ],
    trackingEvents: [
      { time: '12 июн 09:00', title: 'Создан заказ', location: 'Актау' },
      { time: '13 июн 12:00', title: 'Идет поиск перевозчика', location: 'CaspX' },
    ],
    progressLabel: '0 км',
    remainingLabel: '580 км',
    speedLabel: 'Ожидание',
    cargoImages: [],
  },
  {
    id: '240630-018',
    number: '240630-018',
    from: 'Курык',
    fromCountry: 'Казахстан',
    fromRegion: 'Мангистауская область',
    to: 'Баку',
    toCountry: 'Азербайджан',
    toRegion: 'Азербайджан',
    cargoType: 'Продукты',
    weight: 18,
    volume: 75,
    places: 14,
    pickupDate: '2026-06-30',
    deliveryDate: '2026-07-02T16:00:00.000Z',
    price: 950000,
    status: 'delivered',
    createdAt: '2026-06-30T07:00:00.000Z',
    transportType: 'Рефрижератор',
    requirements: ['Температурный режим'],
    carrierId: 'carrier-3',
    notes: 'Без отклонений.',
    routeStops: [
      { title: 'Курык', subtitle: 'Казахстан', color: 'amber' },
      { title: 'Баку', subtitle: 'Азербайджан', color: 'green' },
    ],
    trackingEvents: [
      { time: '30 июн 08:00', title: 'Загружено', location: 'Курык' },
      { time: '01 июл 10:30', title: 'В пути', location: 'Каспийское море' },
      { time: '02 июл 14:15', title: 'Доставлено', location: 'Баку' },
    ],
    progressLabel: '430 км',
    remainingLabel: '0 км',
    speedLabel: 'Завершен',
    cargoImages: [],
  },
]

export const stats = {
  trucks: 387,
  vessels: 26,
  activeCargos: 512,
  avgWaitTime: '2.1 ч',
}

export const homeHighlights = [
  { id: 'trucks', label: 'грузовиков', value: '387', delta: '+8%', tone: 'blue' },
  { id: 'carriers', label: 'перевозчиков', value: '26', delta: '+3', tone: 'violet' },
  { id: 'cargos', label: 'мин т', value: '512', delta: '+12%', tone: 'green' },
  { id: 'eta', label: 'ожидание', value: '2.1 ч', delta: '-5%', tone: 'amber' },
] as const

export const loadMapNodes: MapNode[] = [
  { id: 'aktau', label: 'Актау', x: 18, y: 48, status: 'high' },
  { id: 'kuryk', label: 'Курык', x: 33, y: 69, status: 'medium' },
  { id: 'beineu', label: 'Бейнеу', x: 62, y: 18, status: 'medium' },
  { id: 'baku', label: 'Баку', x: 80, y: 72, status: 'high' },
]

export const transitRoutes: TimelineRoute[] = [
  { id: 'route-1', from: 'Актау', to: 'Баку', status: 'active' },
  { id: 'route-2', from: 'Актау', to: 'Туркменбаши', status: 'warning' },
  { id: 'route-3', from: 'Курык', to: 'Баку', status: 'active' },
]

export const portLoads: LoadPoint[] = [
  { id: 'port-aktau', name: 'Порт Актау', value: 76, level: 'high' },
  { id: 'port-kuryk', name: 'Порт Курык', value: 58, level: 'medium' },
  { id: 'port-bautino', name: 'Порт Баутино', value: 24, level: 'low' },
]

export const checkpointLoads: LoadPoint[] = [
  { id: 'chk-kuryk', name: 'Курык', value: 58, level: 'medium' },
  { id: 'chk-temir', name: 'Темир-Баба', value: 89, level: 'high' },
  { id: 'chk-tazhen', name: 'Тажен', value: 23, level: 'low' },
]

export const vehicles: Vehicle[] = [
  {
    id: 'vehicle-1',
    name: 'KZ 123 AB 12',
    type: 'Тентовый',
    capacity: '20 т',
    volume: '82 м³',
    plate: 'KZ 123 AB 12',
    status: 'active',
    location: 'На линии',
  },
  {
    id: 'vehicle-2',
    name: 'KZ 456 CD 13',
    type: 'Рефрижератор',
    capacity: '18 т',
    volume: '75 м³',
    plate: 'KZ 456 CD 13',
    status: 'active',
    location: 'На линии',
  },
  {
    id: 'vehicle-3',
    name: 'KZ 789 GH 56',
    type: 'Трал',
    capacity: '25 т',
    volume: '70 м³',
    plate: 'KZ 789 GH 56',
    status: 'standby',
    location: 'На обслуживании',
  },
]

export const notifications: Notification[] = [
  {
    id: 'notification-1',
    type: 'carrier_found',
    title: 'Найден перевозчик',
    message: 'Caspian Logistics подтвердил готовность взять ваш заказ №240615-001.',
    read: false,
    createdAt: '2026-06-15T10:45:00.000Z',
  },
  {
    id: 'notification-2',
    type: 'order_updated',
    title: 'Обновление маршрута',
    message: 'Заказ №240615-001 вошел в фазу перевозки по морскому участку.',
    read: false,
    createdAt: '2026-06-15T11:30:00.000Z',
  },
  {
    id: 'notification-3',
    type: 'new_message',
    title: 'Новое сообщение',
    message: 'AI Assistant подготовил сводку по пропускной способности КПП Курык.',
    read: true,
    createdAt: '2026-06-15T09:10:00.000Z',
  },
]

export const chats: Chat[] = [
  {
    id: 'chat-1',
    participant: {
      id: 'carrier-1',
      name: 'Caspian Logistics',
    },
    lastMessage: 'Заказ создан. Вы можете посмотреть доступных перевозчиков.',
    unreadCount: 1,
  },
  {
    id: 'chat-2',
    participant: {
      id: 'ai-assistant',
      name: 'AI Assistant',
    },
    lastMessage: 'Оптимальный маршрут найден: Актау -> Курык -> Баку.',
    unreadCount: 0,
  },
]

export const initialMessages: Record<string, Message[]> = {
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

export const aiRoute: Route = {
  route: ['Актау', 'Курык', 'Баку'],
  distance: 740,
  eta: '12 ч',
  risk: 'Средний',
  cost: '2 150 000 ₸',
}

export const analyticsSeries = {
  loadForecast: [
    { date: '10.06', load: 290 },
    { date: '11.06', load: 402 },
    { date: '12.06', load: 318 },
    { date: '13.06', load: 430 },
    { date: '14.06', load: 305 },
    { date: '15.06', load: 418 },
    { date: '16.06', load: 387 },
  ],
  transit: [
    { name: '10.06', value: 300 },
    { name: '11.06', value: 410 },
    { name: '12.06', value: 340 },
    { name: '13.06', value: 460 },
    { name: '14.06', value: 350 },
    { name: '15.06', value: 430 },
    { name: '16.06', value: 387 },
  ],
  cargos: [
    { name: 'Актау -> Баку', value: 45230 },
    { name: 'Актау -> Туркменбаши', value: 32120 },
    { name: 'Курык -> Баку', value: 26450 },
  ],
}

export const supportItems: SupportItem[] = [
  {
    id: 'faq',
    title: 'Частые вопросы',
    description: 'Ответы на популярные вопросы',
    icon: 'help',
  },
  {
    id: 'contact',
    title: 'Связаться с нами',
    description: 'Онлайн чат с оператором',
    icon: 'chat',
  },
  {
    id: 'issue',
    title: 'Сообщить о проблеме',
    description: 'Мы быстро проверим обращение',
    icon: 'alert',
  },
  {
    id: 'call',
    title: 'Звонок в поддержку',
    description: '+7 700 123 45 67',
    icon: 'phone',
  },
]

export const settingsItems: SettingsItem[] = [
  { id: 'notifications', label: 'Уведомления', value: 'Вкл' },
  { id: 'theme', label: 'Тема', value: 'Темная' },
  { id: 'language', label: 'Язык', value: 'Русский' },
  { id: 'measure', label: 'Единицы измерения', value: 'Метрические' },
  { id: 'security', label: 'Безопасность', value: 'Смена пароля' },
  { id: 'privacy', label: 'Конфиденциальность', value: 'Политика данных' },
]

export const profileMenu = [
  { id: 'history', label: 'История заказов', description: 'Все ваши рейсы' },
  { id: 'settings', label: 'Настройки', description: 'Уведомления и параметры' },
  { id: 'support', label: 'Поддержка', description: 'Связь с командой' },
  { id: 'about', label: 'О приложении', description: 'Версия и информация' },
] as const

export function getCarrierById(id?: string) {
  return carriers.find((carrier) => carrier.id === id)
}

export function getOrderById(id?: string) {
  return orders.find((order) => order.id === id)
}

export function formatMoney(value: number) {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₸`
}

export function statusTone(value: number) {
  if (value >= 75) return 'high'
  if (value >= 40) return 'medium'
  return 'low'
}
