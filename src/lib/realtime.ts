import type { Message, Notification, Order } from '@/types'

type RealtimeEventMap = {
  chat: {
    chatId: string
    message: Message
    lastMessage: string
  }
  notification: {
    notification: Notification
  }
  tracking: {
    orderId: string
    event: NonNullable<Order['trackingEvents']>[number]
    progressLabel: string
    remainingLabel: string
    speedLabel: string
  }
}

type ChannelName = keyof RealtimeEventMap
type Listener<K extends ChannelName> = (payload: RealtimeEventMap[K]) => void

class RealtimeBridge {
  private target = new EventTarget()
  private connected = false
  private mockTimers: number[] = []

  connect() {
    if (this.connected) return
    this.connected = true

    this.mockTimers.push(
      window.setInterval(() => {
        this.emit('notification', {
          notification: {
            id: `rt-notification-${Date.now()}`,
            type: 'order_updated',
            title: 'Обновление в реальном времени',
            message: 'Появилось новое изменение по маршруту и очереди на терминале.',
            read: false,
            createdAt: new Date().toISOString(),
          },
        })
      }, 30000),
    )

    this.mockTimers.push(
      window.setInterval(() => {
        this.emit('chat', {
          chatId: 'chat-1',
          message: {
            id: `rt-message-${Date.now()}`,
            senderId: 'carrier-1',
            text: 'Онлайн-обновление: машина проходит досмотр и будет готова к подаче через 20 минут.',
            createdAt: new Date().toISOString(),
          },
          lastMessage: 'Онлайн-обновление: машина проходит досмотр и будет готова к подаче через 20 минут.',
        })
      }, 24000),
    )

    this.mockTimers.push(
      window.setInterval(() => {
        this.emit('tracking', {
          orderId: '240615-001',
          event: {
            time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
            title: 'Обновление трекинга',
            location: 'Морской участок Каспийского маршрута',
          },
          progressLabel: `${320 + Math.floor(Math.random() * 80)} км`,
          remainingLabel: `${Math.max(120, 420 - Math.floor(Math.random() * 90))} км`,
          speedLabel: `${68 + Math.floor(Math.random() * 9)} км/ч`,
        })
      }, 20000),
    )
  }

  disconnect() {
    this.mockTimers.forEach((timer) => window.clearInterval(timer))
    this.mockTimers = []
    this.connected = false
  }

  subscribe<K extends ChannelName>(channel: K, listener: Listener<K>) {
    const wrapped = (event: Event) => listener((event as CustomEvent<RealtimeEventMap[K]>).detail)
    this.target.addEventListener(channel, wrapped)
    return () => this.target.removeEventListener(channel, wrapped)
  }

  emit<K extends ChannelName>(channel: K, payload: RealtimeEventMap[K]) {
    this.target.dispatchEvent(new CustomEvent(channel, { detail: payload }))
  }
}

export const realtimeBridge = new RealtimeBridge()
