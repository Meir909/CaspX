import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageIntro, SectionCard } from '@/components/app/primitives'

export default function CarrierFreeTransportPage() {
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="space-y-4">
        <PageIntro title="Опубликовано" subtitle="Свободный транспорт теперь доступен грузоотправителям" />
        <SectionCard>
          <div className="text-sm text-text-secondary">
            Заявка опубликована. Система покажет ваш транспорт в подборе на ближайшие маршруты.
          </div>
        </SectionCard>
      </div>
    )
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        setSubmitted(true)
      }}
    >
      <PageIntro title="Свободный транспорт" subtitle="Опубликуйте доступное ТС на маршрут" />

      <SectionCard title="Маршрут">
        <div className="space-y-3">
          <Input defaultValue="Актау" />
          <Input defaultValue="Баку" />
        </div>
      </SectionCard>

      <SectionCard title="Детали">
        <div className="grid grid-cols-2 gap-3">
          <Input type="date" defaultValue="2024-06-15" />
          <Input type="number" defaultValue="20" />
          <Input type="number" defaultValue="82" />
          <Input defaultValue="Тентовый" />
        </div>
      </SectionCard>

      <Button className="w-full" type="submit">
        Опубликовать
      </Button>
    </form>
  )
}
