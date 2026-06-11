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

export const api = {
  auth: {
    login: async (email: string, _password: string): Promise<User> => {
      await delay(300)
      currentUser = { ...currentUser, email }
      return currentUser
    },
    register: async (data: Partial<User> & { password?: string }): Promise<User> => {
      await delay(400)
      currentUser = {
        ...appUser,
        name: data.name || appUser.name,
        email: data.email || appUser.email,
        phone: data.phone || appUser.phone,
      }
      return currentUser
    },
    forgotPassword: async (_email: string): Promise<void> => {
      await delay(400)
    },
    getProfile: async (): Promise<User> => {
      await delay(200)
      return currentUser
    },
    becomeCarrier: async (data: BecomeCarrierPayload): Promise<User> => {
      await delay(600)

      currentUser = {
        ...currentUser,
        company: data.company || currentUser.company,
        carrierStatus: 'approved',
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
        volumeLabel: `${data.volume || '82'} м³`,
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
    },
  },

  orders: {
    getOrders: async (): Promise<Order[]> => {
      await delay(300)
      return [...ordersDb]
    },
    getOrder: async (id: string): Promise<Order | undefined> => {
      await delay(200)
      return ordersDb.find((order) => order.id === id)
    },
    createOrder: async (data: CreateOrderPayload): Promise<Order> => {
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
        return 'Оптимальный маршрут: Актау -> Курык -> Баку. Время в пути около 12 часов, стоимость от 2 150 000 ₸.'
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
