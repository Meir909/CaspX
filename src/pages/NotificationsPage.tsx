import { useEffect } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { useNotifications } from '@/hooks'
import { useNotificationStore } from '@/store'

export default function NotificationsPage() {
  const notificationsQuery = useNotifications()
  const { notifications, setNotifications, markAsRead, markAllAsRead } = useNotificationStore()

  useEffect(() => {
    if (notificationsQuery.data) {
      setNotifications(notificationsQuery.data)
    }
  }, [notificationsQuery.data, setNotifications])

  return (
    <div className="space-y-4">
      <PageIntro
        title="Уведомления"
        subtitle={`${notifications.filter((item) => !item.read).length} непрочитанных`}
        action={
          <Button size="sm" variant="ghost" onClick={markAllAsRead}>
            <Check size={16} />
          </Button>
        }
      />

      {notificationsQuery.isLoading ? (
        <LoadingList count={4} />
      ) : notificationsQuery.isError ? (
        <ErrorState onRetry={() => void notificationsQuery.refetch()} />
      ) : notifications.length === 0 ? (
        <EmptyState title="Уведомлений пока нет" description="Системные события, сообщения и изменения статусов появятся здесь." />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <button key={notification.id} type="button" onClick={() => markAsRead(notification.id)} className="w-full text-left">
              <SectionCard>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{notification.title}</div>
                    <div className="mt-2 text-sm text-text-secondary">{notification.message}</div>
                    <div className="mt-2 text-xs text-text-secondary">
                      {new Date(notification.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  {!notification.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                </div>
              </SectionCard>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
