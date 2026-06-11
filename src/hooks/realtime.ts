import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { realtimeBridge } from '@/lib/realtime'
import { useNotificationStore } from '@/store'
import type { Chat, Message, Notification, Order } from '@/types'

export function useRealtimeSystem() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((state) => state.addNotification)

  useEffect(() => {
    realtimeBridge.connect()

    const unsubscribeNotification = realtimeBridge.subscribe('notification', ({ notification }) => {
      addNotification(notification)
      queryClient.setQueryData(['notifications'], (current: Notification[] | undefined) => [
        notification,
        ...(current ?? []),
      ])
    })

    const unsubscribeChat = realtimeBridge.subscribe('chat', ({ chatId, message, lastMessage }) => {
      queryClient.setQueryData(['messages', chatId], (current: Message[] | undefined) => [
        ...(current ?? []),
        message,
      ])

      queryClient.setQueryData(['chats'], (current: Chat[] | undefined) =>
        (current ?? []).map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage,
                unreadCount: message.senderId === 'user-1' ? chat.unreadCount : chat.unreadCount + 1,
              }
            : chat,
        ),
      )
    })

    const unsubscribeTracking = realtimeBridge.subscribe('tracking', ({ orderId, event, progressLabel, remainingLabel, speedLabel }) => {
      queryClient.setQueryData(['orders', orderId], (current: Order | undefined) =>
        current
          ? {
              ...current,
              trackingEvents: [...(current.trackingEvents ?? []), event],
              progressLabel,
              remainingLabel,
              speedLabel,
            }
          : current,
      )

      queryClient.setQueryData(['orders'], (current: Order[] | undefined) =>
        (current ?? []).map((order) =>
          order.id === orderId
            ? {
                ...order,
                trackingEvents: [...(order.trackingEvents ?? []), event],
                progressLabel,
                remainingLabel,
                speedLabel,
              }
            : order,
        ),
      )
    })

    return () => {
      unsubscribeNotification()
      unsubscribeChat()
      unsubscribeTracking()
    }
  }, [addNotification, queryClient])
}
