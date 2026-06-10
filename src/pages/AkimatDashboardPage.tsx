import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Map, BarChart3, Truck, Ship, Package, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useStats, useCharts } from '@/hooks'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

export default function AkimatDashboardPage() {
  const navigate = useNavigate()
  const { data: stats } = useStats()
  const { data: charts } = useCharts()

  const kpis = [
    { label: 'Заказов', value: stats?.activeCargos || 512, icon: <Package size={24} />, color: 'text-primary' },
    { label: 'Перевозчиков', value: stats?.trucks || 387, icon: <Truck size={24} />, color: 'text-success' },
    { label: 'Суда', value: stats?.vessels || 26, icon: <Ship size={24} />, color: 'text-accent' },
    { label: 'КПП', value: 8, icon: <Building2 size={24} />, color: 'text-warning' }
  ]

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Akimat Dashboard</h1>
          <p className="text-text-secondary">Аналитика и мониторинг</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5">
              <CardContent className="p-0">
                <div className={cn('mb-3', kpi.color)}>{kpi.icon}</div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-sm text-text-secondary">{kpi.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <BarChart3 size={20} className="text-primary" />
            Транзит грузов
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.transit || []}>
                <defs>
                  <linearGradient id="colorTransit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D6EFD" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0D6EFD" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A2F5D', border: 'none', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#0D6EFD" strokeWidth={3} fillOpacity={1} fill="url(#colorTransit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package size={20} className="text-success" />
            Количество грузов
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.cargos || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A2F5D', border: 'none', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="value" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Map size={20} className="text-accent" />
              Карта мониторинга
            </h3>
            <Button variant="ghost" onClick={() => navigate('/map')}>
              Открыть
            </Button>
          </div>
          <div className="h-48 bg-bg-secondary rounded-xl flex items-center justify-center">
            <Map size={48} className="text-text-secondary opacity-50" />
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
