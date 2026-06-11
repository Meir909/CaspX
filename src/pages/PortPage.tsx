import { BarChart3 } from 'lucide-react'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { portLoads } from '@/data/mock'

export default function PortPage() {
  return (
    <div className="space-y-4">
      <PageIntro title="Порт Актау" subtitle="Оперативная информация по статусу и загрузке" />

      <div className="grid grid-cols-3 gap-3">
        <SectionCard className="p-4">
          <div className="text-xs text-text-secondary">Суда в порту</div>
          <div className="mt-2 text-[28px] font-semibold">8</div>
        </SectionCard>
        <SectionCard className="p-4">
          <div className="text-xs text-text-secondary">Ожидают</div>
          <div className="mt-2 text-[28px] font-semibold">12</div>
        </SectionCard>
        <SectionCard className="p-4">
          <div className="text-xs text-text-secondary">Отгружено сегодня</div>
          <div className="mt-2 text-[28px] font-semibold">1 240 т</div>
        </SectionCard>
      </div>

      <SectionCard title="Загрузка порта">
        <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
          <div className="h-full w-[76%] rounded-full bg-gradient-to-r from-primary to-cyan-400" />
        </div>
        <div className="mt-3 text-sm text-text-secondary">Текущий уровень загрузки: 76%</div>
      </SectionCard>

      <SectionCard title="График загрузки" action={<BarChart3 size={16} className="text-text-secondary" />}>
        <div className="flex h-36 items-end gap-2">
          {[42, 54, 67, 58, 72, 69, 83, 76].map((height, index) => (
            <div key={index} className="flex-1 rounded-t-2xl bg-gradient-to-t from-primary/50 to-primary" style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="mt-3 flex justify-between text-xs text-text-secondary">
          <span>00:00</span>
          <span>12:00</span>
          <span>24:00</span>
        </div>
      </SectionCard>

      <SectionCard title="Последние суда">
        <div className="space-y-3">
          {[
            ['Aktau Star', 'В пути', 'Металл', '5 000 т'],
            ['Caspian Trade', 'Стоянка', 'Зерно', '2 400 т'],
            ['Kuryk Line', 'Разгрузка', 'Контейнеры', '1 700 т'],
          ].map(([name, status, cargo, value]) => (
            <div key={name} className="grid grid-cols-[1.1fr_auto_auto] items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3 text-sm">
              <div>
                <div className="font-medium">{name}</div>
                <div className="mt-1 text-text-secondary">{cargo}</div>
              </div>
              <div className={status === 'В пути' ? 'text-emerald-300' : status === 'Стоянка' ? 'text-amber-300' : 'text-primary'}>{status}</div>
              <div>{value}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Порты региона">
        <div className="space-y-3">
          {portLoads.map((port) => (
            <div key={port.id} className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-4 py-3 text-sm">
              <span className="font-medium">{port.name}</span>
              <span className={port.level === 'high' ? 'text-rose-300' : port.level === 'medium' ? 'text-amber-300' : 'text-emerald-300'}>
                {port.value}%
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
