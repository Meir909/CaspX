import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Bot, MessageSquare, Navigation, BarChart3, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useAIAnalytics, useGenerateRoute } from '@/hooks'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type Tab = 'chat' | 'route' | 'analytics'

export default function AIPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Привет! Я AI-логист. Чем могу помочь?' }
  ])
  const [inputText, setInputText] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const { data: analytics } = useAIAnalytics()
  const { mutate: generateRoute, data: route } = useGenerateRoute()

  const handleSend = () => {
    if (!inputText.trim()) return
    setMessages(prev => [...prev, { role: 'user', text: inputText }])
    setInputText('')
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Понял! Анализирую ваш запрос...' }])
    }, 500)
  }

  const handleGenerateRoute = () => {
    if (from && to) {
      generateRoute({ from, to })
    }
  }

  const tabs = [
    { id: 'chat', label: 'Чат', icon: <MessageSquare size={20} /> },
    { id: 'route', label: 'Маршрут', icon: <Navigation size={20} /> },
    { id: 'analytics', label: 'Аналитика', icon: <BarChart3 size={20} /> }
  ]

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot size={24} className="text-primary" />
            AI Логист
          </h1>
          <p className="text-text-secondary">Умный помощник для логистики</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-bg-card rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'chat' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="h-[calc(100vh-320px)] space-y-4 overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-bg-card'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Спросите что-то..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend}>
              <Send size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {activeTab === 'route' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <Card className="p-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Откуда</label>
                <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Актау" />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-2">Куда</label>
                <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Баку" />
              </div>
              <Button onClick={handleGenerateRoute} className="w-full">
                <Navigation size={20} className="mr-2" />
                Построить маршрут
              </Button>
            </div>
          </Card>

          {route && (
            <Card className="p-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  <h3 className="font-semibold">Оптимальный маршрут</h3>
                </div>
                <div className="space-y-2">
                  {route.route.map((point, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{route.distance}</div>
                    <div className="text-sm text-text-secondary">км</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{route.eta}</div>
                    <div className="text-sm text-text-secondary">ETA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{route.cost}</div>
                    <div className="text-sm text-text-secondary">Стоимость</div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Card className="p-5">
            <h3 className="font-semibold mb-4">Прогноз загруженности</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics?.loadForecast || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0A2F5D', border: 'none', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="load" stroke="#0D6EFD" strokeWidth={3} dot={{ fill: '#0D6EFD' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
