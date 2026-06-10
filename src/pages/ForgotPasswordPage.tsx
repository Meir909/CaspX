import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useForgotPassword } from '@/hooks'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const { mutate, isPending } = useForgotPassword()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(email, {
      onSuccess: () => setSent(true)
    })
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">CaspX</h1>
        <p className="text-text-secondary">Восстановление пароля</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">{sent ? 'Письмо отправлено!' : 'Введите email'}</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center py-8">
              <p className="text-text-secondary mb-6">
                Ссылка для восстановления пароля отправлена на {email}
              </p>
              <Link to="/login">
                <Button className="w-full">Вернуться ко входу</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Загрузка...' : 'Отправить ссылку'}
              </Button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Вернуться ко входу
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
