import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowUpDown, BadgeCheck, PhoneForwarded, Star, TimerReset } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PageIntro, SectionCard, TruckIllustration } from '@/components/app/primitives'
import { formatMoney } from '@/data/mock'
import { useCarriers, useOrders } from '@/hooks'

export default function CarrierSearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price')
  const { data: orders } = useOrders()
  const { data: carriers = [] } = useCarriers()

  const orderId = searchParams.get('order')
  const order = orders?.find((item) => item.id === orderId) ?? orders?.[0]

  const sortedCarriers = useMemo(
    () =>
      [...carriers].sort((left, right) =>
        sortBy === 'price' ? left.price - right.price : right.rating - left.rating,
      ),
    [carriers, sortBy],
  )

  return (
    <div className="space-y-4">
      <PageIntro title="Поиск перевозчика" subtitle={`Найдено ${sortedCarriers.length} перевозчиков`} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-2 text-sm text-text-secondary">
          <ArrowUpDown size={14} />
          Сортировка
        </button>
        <button
          type="button"
          onClick={() => setSortBy('price')}
          className={sortBy === 'price' ? 'rounded-full bg-primary/15 px-3 py-2 text-sm text-primary' : 'rounded-full bg-white/[0.04] px-3 py-2 text-sm text-text-secondary'}
        >
          По цене
        </button>
        <button
          type="button"
          onClick={() => setSortBy('rating')}
          className={sortBy === 'rating' ? 'rounded-full bg-primary/15 px-3 py-2 text-sm text-primary' : 'rounded-full bg-white/[0.04] px-3 py-2 text-sm text-text-secondary'}
        >
          По рейтингу
        </button>
      </div>

      {sortedCarriers.map((carrier, index) => (
        <motion.div
          key={carrier.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <SectionCard>
            <div className="grid grid-cols-[104px_1fr] gap-4">
              {carrier.transportImage ? (
                <div className="overflow-hidden rounded-[20px] border border-white/5 bg-white/[0.03]">
                  <img src={carrier.transportImage} alt={carrier.company} className="h-24 w-full object-cover" />
                </div>
              ) : (
                <TruckIllustration compact />
              )}

              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{carrier.company}</div>
                    <div className="mt-1 text-sm text-text-secondary">
                      {carrier.transport} • {carrier.capacityLabel} • {carrier.volumeLabel}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-amber-300">
                    <Star size={14} fill="currentColor" />
                    <span>{carrier.rating}</span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="default">{carrier.badge}</Badge>
                  <span className="inline-flex items-center gap-1 text-sm text-text-secondary">
                    <TimerReset size={14} />
                    {carrier.etaLabel}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                  {carrier.vehiclePlate ? (
                    <span className="inline-flex items-center gap-1">
                      <BadgeCheck size={13} />
                      {carrier.vehiclePlate}
                    </span>
                  ) : null}
                  {carrier.phone ? (
                    <span className="inline-flex items-center gap-1">
                      <PhoneForwarded size={13} />
                      {carrier.phone}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <div className="text-[28px] font-semibold leading-none">{formatMoney(carrier.price)}</div>
                    <div className="mt-1 text-xs text-text-secondary">
                      {order?.fromCountry}, {order?.from} → {order?.toCountry}, {order?.to}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => navigate(`/orders/${order?.id || ''}`)}>
                    Выбрать
                  </Button>
                </div>
              </div>
            </div>
          </SectionCard>
        </motion.div>
      ))}
    </div>
  )
}
