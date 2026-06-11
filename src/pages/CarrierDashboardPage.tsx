import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard, StatCard, TruckIllustration } from '@/components/app/primitives'
import { formatMoney } from '@/data/mock'
import { useAvailableOrders, useCarrierProfile, useCarrierVehicles, useOrders } from '@/hooks'

export default function CarrierDashboardPage() {
  const navigate = useNavigate()
  const ordersQuery = useOrders()
  const availableOrdersQuery = useAvailableOrders()
  const profileQuery = useCarrierProfile()
  const vehiclesQuery = useCarrierVehicles()

  const orders = ordersQuery.data ?? []
  const availableOrders = availableOrdersQuery.data ?? []
  const vehicles = vehiclesQuery.data ?? []
  const profile = profileQuery.data
  const activeOrders = orders.filter((order) => order.status === 'assigned' || order.status === 'in_progress')

  return (
    <div className="space-y-4">
      <PageIntro
        title={profile?.user?.company || profile?.user?.name || 'Кабинет перевозчика'}
        subtitle={profile?.isApproved ? 'Перевозчик • подтвержден' : 'Перевозчик • на проверке'}
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard value={String(activeOrders.length)} label="активных заказов" delta={`+${availableOrders.length}`} tone="blue" />
        <StatCard value={String(vehicles.length || profile?.vehiclesCount || 0)} label="техники в системе" delta="+0" tone="green" />
        <StatCard value={String(profile?.experienceYears ?? 0)} label="лет опыта" delta={profile?.transportType || 'ROAD'} tone="amber" />
        <StatCard value={String(availableOrders.length)} label="доступных заявок" delta="live" tone="violet" />
      </div>

      <SectionCard
        title="Активные заказы"
        action={
          <button type="button" onClick={() => navigate('/carrier/orders')} className="text-sm text-primary">
            Смотреть все
          </button>
        }
      >
        {ordersQuery.isLoading ? (
          <LoadingList count={2} />
        ) : ordersQuery.isError ? (
          <ErrorState onRetry={() => void ordersQuery.refetch()} />
        ) : activeOrders.length === 0 ? (
          <EmptyState title="Активных заказов нет" description="Новые заявки появятся здесь, когда backend начнет возвращать заказы перевозчика." />
        ) : (
          <div className="space-y-3">
            {activeOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="rounded-2xl bg-white/[0.03] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">№{order.number}</div>
                    <div className="mt-1 text-sm text-text-secondary">
                      {order.from} → {order.to}
                    </div>
                  </div>
                  <span className="text-sm text-primary">
                    {order.status === 'in_progress' ? 'В пути' : 'Подтвержден'}
                  </span>
                </div>
                <div className="mt-3 text-sm text-text-secondary">{formatMoney(order.price)}</div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Мой автопарк"
        action={
          <button type="button" onClick={() => navigate('/carrier/transport')} className="text-sm text-primary">
            Смотреть все
          </button>
        }
      >
        {vehiclesQuery.isLoading ? (
          <LoadingList count={2} />
        ) : vehiclesQuery.isError ? (
          <ErrorState onRetry={() => void vehiclesQuery.refetch()} />
        ) : vehicles.length === 0 ? (
          <EmptyState title="Транспорт не найден" description="Когда backend вернет список машин перевозчика, они появятся в этом блоке." />
        ) : (
          <div className="space-y-3">
            {vehicles.slice(0, 2).map((vehicle) => (
              <div key={vehicle.id} className="grid grid-cols-[1fr_92px] items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3">
                <div>
                  <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                  <div className="mt-1 text-sm text-text-secondary">
                    {vehicle.plateNumber} • {vehicle.capacityTons} т • {vehicle.cargoVolume} м3
                  </div>
                  <div className="mt-1 text-sm text-emerald-300">{vehicle.year}</div>
                </div>
                {vehicle.vehicleImageUrl ? (
                  <div className="overflow-hidden rounded-[20px] border border-white/5 bg-white/[0.03]">
                    <img src={vehicle.vehicleImageUrl} alt={vehicle.plateNumber} className="h-20 w-24 object-cover" />
                  </div>
                ) : (
                  <TruckIllustration compact />
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Button variant="secondary" className="w-full" onClick={() => navigate('/carrier/free-transport')}>
        Опубликовать свободный транспорт
      </Button>
    </div>
  )
}
