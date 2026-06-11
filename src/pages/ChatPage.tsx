import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { useChats, useMessages, useSendMessage } from '@/hooks'

export default function ChatPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [message, setMessage] = useState('')
  const chatsQuery = useChats()
  const messagesQuery = useMessages(id || '')
  const { mutateAsync, isPending } = useSendMessage()
  const chats = chatsQuery.data ?? []
  const messages = messagesQuery.data ?? []

  if (id) {
    const chat = chats.find((item) => item.id === id)

    return (
      <div className="space-y-4">
        <PageIntro title={chat?.participant.name || 'Диалог'} subtitle="Онлайн" />

        {messagesQuery.isLoading ? (
          <LoadingList count={4} />
        ) : messagesQuery.isError ? (
          <ErrorState onRetry={() => void messagesQuery.refetch()} />
        ) : messages.length === 0 ? (
          <EmptyState title="Сообщений пока нет" description="Начните диалог первым, чтобы запустить чат." />
        ) : (
          <SectionCard>
            <div className="space-y-3">
              {messages.map((item) => (
                <div key={item.id} className={item.senderId === 'user-1' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={item.senderId === 'user-1' ? 'max-w-[86%] rounded-[22px] bg-primary/15 px-4 py-3 text-sm text-white' : 'max-w-[86%] rounded-[22px] bg-white/[0.04] px-4 py-3 text-sm text-slate-200'}>
                    <div>{item.text}</div>
                    <div className="mt-1 text-[11px] text-text-secondary">
                      {new Date(item.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Напишите сообщение..."
            onKeyDown={async (event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                if (message.trim()) {
                  await mutateAsync({ chatId: id, text: message })
                  setMessage('')
                }
              }
            }}
          />
          <Button
            size="icon"
            disabled={isPending}
            onClick={async () => {
              if (!message.trim()) return
              await mutateAsync({ chatId: id, text: message })
              setMessage('')
            }}
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageIntro title="Сообщения" subtitle={`${chats.length} активных диалога`} />

      {chatsQuery.isLoading ? (
        <LoadingList count={4} />
      ) : chatsQuery.isError ? (
        <ErrorState onRetry={() => void chatsQuery.refetch()} />
      ) : chats.length === 0 ? (
        <EmptyState title="Диалогов пока нет" description="Когда появятся сообщения от перевозчиков и AI, они будут видны здесь." />
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <button key={chat.id} type="button" onClick={() => navigate(`/chat/${chat.id}`)} className="w-full text-left">
              <SectionCard>
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-lg font-semibold text-primary">
                    {chat.participant.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate font-medium">{chat.participant.name}</div>
                      {chat.unreadCount > 0 ? (
                        <span className="rounded-full bg-primary/15 px-2 py-1 text-xs text-primary">{chat.unreadCount}</span>
                      ) : null}
                    </div>
                    <div className="mt-1 truncate text-sm text-text-secondary">{chat.lastMessage}</div>
                  </div>
                </div>
              </SectionCard>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
