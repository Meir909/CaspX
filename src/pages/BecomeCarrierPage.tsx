import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { Select } from '@/components/ui/select'
import { useBecomeCarrier } from '@/hooks'

export default function BecomeCarrierPage() {
  const [submitted, setSubmitted] = useState(false)
  const { mutate, isPending } = useBecomeCarrier()

  if (submitted) {
    return (
      <div className="space-y-4">
        <PageIntro title="Заявка отправлена" subtitle="Мы проверим данные и свяжемся с вами в течение 24 часов" />
        <SectionCard>
          <div className="text-sm text-text-secondary">
            Статус заявки можно будет отслеживать в профиле. После одобрения откроется кабинет перевозчика.
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
        mutate(
          {},
          {
            onSuccess: () => setSubmitted(true),
          },
        )
      }}
    >
      <PageIntro title="Стать перевозчиком" subtitle="Заполните информацию о компании и транспорте" />

      <SectionCard title="Компания">
        <div className="space-y-3">
          <Input defaultValue="TOO WestTrans KZ" />
          <Input defaultValue="123456789012" />
          <Select defaultValue="Автомобильные">
            <option>Автомобильные</option>
            <option>Морские</option>
            <option>Мультимодальные</option>
          </Select>
        </div>
      </SectionCard>

      <SectionCard title="Транспорт и опыт">
        <div className="grid grid-cols-2 gap-3">
          <Input defaultValue="20" />
          <Input defaultValue="15" />
          <Input defaultValue="5+ лет" />
          <Input defaultValue="KZ 123 AB 12" />
        </div>
      </SectionCard>

      <SectionCard title="Документы">
        <Button variant="secondary" type="button" className="w-full">
          Прикрепить файлы
        </Button>
      </SectionCard>

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? 'Отправка...' : 'Отправить на модерацию'}
      </Button>
    </form>
  )
}
