import {
  User,
  Order,
  Carrier,
  Port,
  Checkpoint,
  Vessel,
  Truck,
  Chat,
  Message,
  Route,
} from '@/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const api = {
  auth: {
    login: async (email: string, _password: string): Promise<User> => {
      await delay(500)
      return {
        id: '1',
        name: 'Алишер А.',
        email,
        phone: '+7 701 123 4567',
        role: 'user',
        rating: 4.8,
        company: 'TOO Caspian Logistics',
        carrierStatus: 'approved'
      }
    },
    register: async (data: any): Promise<User> => {
      await delay(500)
      return { id: '2', ...data, role: 'user' }
    },
    forgotPassword: async (_email: string): Promise<void> => {
      await delay(500)
    },
    getProfile: async (): Promise<User> => {
      await delay(300)
      return {
        id: '1',
        name: 'Алишер А.',
        email: 'alisher@example.com',
        phone: '+7 701 123 4567',
        role: 'user',
        rating: 4.8,
        company: 'TOO Caspian Logistics',
        carrierStatus: 'approved'
      }
    },
    becomeCarrier: async (_data: any): Promise<User> => {
      await delay(1000)
      return {
        id: '1',
        name: 'Алишер А.',
        email: 'alisher@example.com',
        phone: '+7 701 123 4567',
        role: 'user',
        rating: 4.8,
        company: 'TOO Caspian Logistics',
        carrierStatus: 'pending'
      }
    }
  },

  orders: {
    getOrders: async (): Promise<Order[]> => {
      await delay(500)
      return [
        {
          id: '1',
          from: 'Актау',
          to: 'Баку',
          cargoType: 'Сталь',
          weight: 20,
          volume: 40,
          date: new Date().toISOString(),
          status: 'searching',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          from: 'Атырау',
          to: 'Актау',
          cargoType: 'Нефтепродукты',
          weight: 15,
          volume: 30,
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'in_progress',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    },
    createOrder: async (data: any): Promise<Order> => {
      await delay(500)
      return { id: Date.now().toString(), ...data, status: 'created', createdAt: new Date().toISOString() }
    },
    getCarriers: async (): Promise<Carrier[]> => {
      await delay(500)
      return [
        {
          id: '1',
          name: 'John Doe',
          rating: 4.9,
          experience: 5,
          price: 150000,
          transport: 'MAN TGX 2022',
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        {
          id: '2',
          name: 'Sarah Smith',
          rating: 4.7,
          experience: 3,
          price: 140000,
          transport: 'Volvo FH 2021',
          avatar: 'https://i.pravatar.cc/150?img=2'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          rating: 4.8,
          experience: 7,
          price: 160000,
          transport: 'Scania R 2023',
          avatar: 'https://i.pravatar.cc/150?img=3'
        }
      ]
    }
  },

  map: {
    getPorts: async (): Promise<Port[]> => {
      await delay(300)
      return [
        { id: '1', name: 'Порт Актау', location: { lat: 43.6350, lng: 51.1680 }, load: 75 },
        { id: '2', name: 'Порт Баку', location: { lat: 40.3777, lng: 49.8920 }, load: 60 }
      ]
    },
    getCheckpoints: async (): Promise<Checkpoint[]> => {
      await delay(300)
      return [
        { id: '1', name: 'КПП Курдык', location: { lat: 43.0, lng: 52.0 }, load: 45 },
        { id: '2', name: 'КПП Бейнеу', location: { lat: 45.0, lng: 54.0 }, load: 85 }
      ]
    },
    getVessels: async (): Promise<Vessel[]> => {
      await delay(300)
      return [
        { id: '1', name: 'Caspian Star', location: { lat: 42.0, lng: 50.5 }, status: 'В движении' },
        { id: '2', name: 'Aktau Express', location: { lat: 41.0, lng: 50.0 }, status: 'Стоит' }
      ]
    },
    getTrucks: async (): Promise<Truck[]> => {
      await delay(300)
      return [
        { id: '1', name: 'MAN 001', location: { lat: 43.5, lng: 51.0 }, status: 'Свободен' },
        { id: '2', name: 'Volvo 002', location: { lat: 43.7, lng: 51.2 }, status: 'Занят' }
      ]
    }
  },

  ai: {
    chat: async (message: string): Promise<string> => {
      await delay(1000)
      return `AI ответ на: "${message}"`
    },
    generateRoute: async (from: string, to: string): Promise<Route> => {
      await delay(1000)
      return {
        route: [from, 'Порт Актау', 'Море', 'Порт Баку', to],
        distance: 580,
        eta: '12 часов',
        risk: 'Низкий',
        cost: '150 000 ₸'
      }
    },
    getAnalytics: async (): Promise<any> => {
      await delay(500)
      return {
        loadForecast: [
          { date: 'Пн', load: 60 },
          { date: 'Вт', load: 75 },
          { date: 'Ср', load: 80 },
          { date: 'Чт', load: 65 },
          { date: 'Пт', load: 70 },
          { date: 'Сб', load: 45 },
          { date: 'Вс', load: 40 }
        ]
      }
    }
  },

  chat: {
    getChats: async (): Promise<Chat[]> => {
      await delay(300)
      return [
        {
          id: '1',
          participant: {
            id: '2',
            name: 'John Doe',
            avatar: 'https://i.pravatar.cc/150?img=1'
          },
          lastMessage: 'Привет! Я готов взять ваш заказ',
          unreadCount: 2
        },
        {
          id: '2',
          participant: {
            id: '3',
            name: 'Sarah Smith',
            avatar: 'https://i.pravatar.cc/150?img=2'
          },
          lastMessage: 'Спасибо за быструю доставку!',
          unreadCount: 0
        }
      ]
    },
    getMessages: async (_chatId: string): Promise<Message[]> => {
      await delay(300)
      return [
        {
          id: '1',
          senderId: '2',
          text: 'Привет! Я готов взять ваш заказ',
          createdAt: new Date(Date.now() - 60000).toISOString()
        },
        {
          id: '2',
          senderId: '1',
          text: 'Отлично! Когда вы сможете забрать?',
          createdAt: new Date(Date.now() - 30000).toISOString()
        }
      ]
    },
    sendMessage: async (_chatId: string, text: string): Promise<Message> => {
      await delay(200)
      return {
        id: Date.now().toString(),
        senderId: '1',
        text,
        createdAt: new Date().toISOString()
      }
    }
  },

  stats: {
    getStats: async (): Promise<any> => {
      await delay(300)
      return {
        trucks: 387,
        vessels: 26,
        activeCargos: 512,
        avgWaitTime: '2.1 ч'
      }
    },
    getCharts: async (): Promise<any> => {
      await delay(300)
      return {
        transit: [
          { name: 'Янв', value: 400 },
          { name: 'Фев', value: 300 },
          { name: 'Мар', value: 500 },
          { name: 'Апр', value: 450 },
          { name: 'Май', value: 600 },
          { name: 'Июнь', value: 550 }
        ],
        cargos: [
          { name: 'Янв', value: 200 },
          { name: 'Фев', value: 180 },
          { name: 'Мар', value: 250 },
          { name: 'Апр', value: 220 },
          { name: 'Май', value: 300 },
          { name: 'Июнь', value: 280 }
        ]
      }
    }
  }
}
