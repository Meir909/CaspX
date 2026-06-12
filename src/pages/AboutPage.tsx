import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageIntro, SectionCard } from '@/components/app/primitives'

export default function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <PageIntro title="О приложении" subtitle="Информация о цифровой платформе CaspX." />

      <SectionCard>
        <div className="text-center">
          <div className="text-[42px] font-semibold">
            Casp<span className="text-primary">X</span>
          </div>
          <div className="mt-2 text-sm text-text-secondary">Мангистауская область</div>
          <div className="mt-6 text-sm leading-6 text-slate-300">
            CaspX — цифровая платформа для логистики в Каспийском регионе. Она объединяет заказчиков,
            перевозчиков, маршруты, статус доставки и рабочие формы в одном мобильном интерфейсе.
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => navigate('/terms')}>
              Условия использования
            </Button>
            <Button variant="secondary" onClick={() => navigate('/privacy')}>
              Политика конфиденциальности
            </Button>
          </div>
          <div className="mt-6 space-y-2 text-sm text-text-secondary">
            <div>Версия 1.0.0</div>
            <div>© 2026 CaspX. Все права защищены.</div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
