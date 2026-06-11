import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BotBubble, PageIntro, SectionCard } from '@/components/app/primitives'
import { useAIAnalytics, useAIChat } from '@/hooks'

const suggestions = [
  'Какой маршрут быстрее из Актау в Баку?',
  'Какая ситуация на границе?',
  'Показать погоду на маршруте',
  'Найти ближайшие заправки',
]

export default function AIPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Здравствуйте! Я ваш AI-помощник по логистике. Чем могу помочь?',
    },
    {
      role: 'user',
      text: 'Какой маршрут быстрее из Актау в Баку?',
    },
    {
      role: 'assistant',
      text: 'Оптимальный маршрут: Актау -> Курык -> Баку. Расстояние 740 км, время в пути около 12 часов, загруженность средняя.',
    },
  ])
  const [input, setInput] = useState('')
  const { mutateAsync, isPending } = useAIChat()
  const { data: analytics } = useAIAnalytics()

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    const response = await mutateAsync(text)
    setMessages((prev) => [...prev, { role: 'assistant', text: response }])
  }

  return (
    <div className="space-y-4">
      <PageIntro title="AI Assistant" subtitle="Подсказывает маршрут, ETA, загрузку портов и КПП" />

      <SectionCard>
        <div className="flex items-start gap-3">
          <BotBubble />
          <div className="text-sm text-text-secondary">
            Я умею подбирать маршрут, оценивать загрузку портов и предупреждать о перегрузке КПП.
          </div>
        </div>
      </SectionCard>

      <div className="space-y-3">
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={message.role === 'user' ? 'max-w-[86%] rounded-[22px] bg-primary/15 px-4 py-3 text-sm text-white' : 'max-w-[86%] rounded-[22px] bg-white/[0.04] px-4 py-3 text-sm text-slate-200'}>
              {message.text}
            </div>
          </div>
        ))}
      </div>

      <SectionCard title="Быстрые действия">
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => sendMessage(item)}
              className="rounded-2xl bg-white/[0.04] px-3 py-3 text-left text-sm text-text-secondary"
            >
              {item}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Сводка загрузки">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-white/[0.03] px-3 py-3">
            <div className="text-xs text-text-secondary">Сегодня</div>
            <div className="mt-1 text-lg font-medium">{analytics?.transit?.[analytics.transit.length - 1]?.value ?? 387}</div>
          </div>
          <div className="rounded-2xl bg-white/[0.03] px-3 py-3">
            <div className="text-xs text-text-secondary">Пик</div>
            <div className="mt-1 text-lg font-medium">430</div>
          </div>
          <div className="rounded-2xl bg-white/[0.03] px-3 py-3">
            <div className="text-xs text-text-secondary">Тренд</div>
            <div className="mt-1 text-lg font-medium text-emerald-300">+12%</div>
          </div>
        </div>
      </SectionCard>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Задайте вопрос..."
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void sendMessage(input)
            }
          }}
        />
        <Button size="icon" onClick={() => void sendMessage(input)} disabled={isPending}>
          <Send size={18} />
        </Button>
      </div>
    </div>
  )
}
