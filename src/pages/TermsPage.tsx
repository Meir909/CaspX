import { PageIntro, SectionCard } from '@/components/app/primitives'

const sections = [
  {
    title: '1. Использование сервиса',
    body: 'Платформа CaspX используется для создания заявок, взаимодействия между заказчиком и перевозчиком, а также просмотра статусов доставки и связанных данных.',
  },
  {
    title: '2. Ответственность сторон',
    body: 'Пользователь отвечает за корректность маршрута, контактных данных, фотографий груза и сведений о транспорте. Перевозчик отвечает за актуальность данных своего автопарка.',
  },
  {
    title: '3. Медиа и документы',
    body: 'Загружаемые изображения автоматически уменьшаются и используются только в рамках логистического процесса, карточек заявок и профиля.',
  },
]

export default function TermsPage() {
  return (
    <div className="space-y-4">
      <PageIntro title="Условия использования" subtitle="Краткие правила работы с платформой CaspX." />
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
