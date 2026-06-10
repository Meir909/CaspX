import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Phone, Video, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { useChats, useMessages, useSendMessage } from '@/hooks'

export default function ChatPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: chats } = useChats()
  const { data: messages } = useMessages(id || '')
  const { mutate: sendMessage } = useSendMessage()
  const [inputText, setInputText] = useState('')

  const chat = chats?.find(c => c.id === id)

  const handleSend = () => {
    if (!inputText.trim() || !id) return
    sendMessage({ chatId: id, text: inputText })
    setInputText('')
  }

  if (id) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 bg-bg-secondary border-b border-gray-700/30 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}>
            <ArrowLeft size={24} />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold">
                {chat?.participant.name.charAt(0)}
              </div>
              <div>
                <h2 className="font-semibold">{chat?.participant.name}</h2>
                <p className="text-sm text-success">В сети</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <Phone size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <Video size={20} />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical size={20} />
          </Button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages?.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`flex ${msg.senderId === '1' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.senderId === '1'
                    ? 'bg-primary text-white'
                    : 'bg-bg-card'
                }`}
              >
                {msg.text}
                <div className={`text-xs mt-1 ${msg.senderId === '1' ? 'text-white/70' : 'text-text-secondary'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-4 bg-bg-secondary border-t border-gray-700/30">
          <div className="flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Написать сообщение..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend}>
              <Send size={20} />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Чаты</h1>
          <p className="text-text-secondary">{chats?.length || 0} диалогов</p>
        </div>
      </div>

      <div className="space-y-2">
        {chats?.map((chat, i) => (
          <motion.div
            key={chat.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className="p-4 cursor-pointer hover:bg-bg-secondary/50 transition-colors"
              onClick={() => navigate(`/chat/${chat.id}`)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center font-bold text-lg">
                  {chat.participant.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{chat.participant.name}</h3>
                    {chat.unreadCount > 0 && (
                      <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary text-sm truncate">{chat.lastMessage}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
