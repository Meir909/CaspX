import { PageIntro, SectionCard } from '@/components/app/primitives'

const sections = [
  {
    title: '1. Какие данные мы используем',
    body: 'Во фронтенде и backend используются имя, email, телефон, маршруты, фотографии груза, фотографии транспорта и служебные статусы заказов.',
  },
  {
    title: '2. Для чего это нужно',
    body: 'Эти данные нужны для авторизации, создания заказа, отображения статуса доставки, маршрута на карте, карточек перевозчика и клиентской поддержки.',
  },
  {
    title: '3. Как хранятся файлы',
    body: 'Аватары и фото заказов отправляются в backend отдельными upload-запросами. Фронтенд хранит только ссылки, которые возвращает сервер.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="space-y-4">
      <PageIntro title="Политика конфиденциальности" subtitle="Как CaspX работает с пользовательскими данными." />
      <SectionCard>
        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="font-medium">{section.title}</div>
              <div className="mt-2 text-sm leading-6 text-text-secondary">{section.body}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
