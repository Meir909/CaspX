import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, KeyRound, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthShell } from '@/components/app/auth-shell'
import { useLogin } from '@/hooks'
import { useAuthStore } from '@/store'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { mutate, isPending, error } = useLogin()
  const [email, setEmail] = useState('alisher@caspx.kz')
  const [password, setPassword] = useState('12345678')

  return (
    <AuthShell
      title="Вход в CaspX"
      subtitle="Откройте заказы, перевозчиков, аналитику и мониторинг маршрутов в одном интерфейсе."
    >
      <Card>
        <CardHeader>
          <CardTitle>Войти</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              mutate(
                { email, password },
                {
                  onSuccess: (user) => {
                    login(user)
                    navigate('/')
                  },
                },
              )
            }}
          >
            <label className="block space-y-2">
              <span className="text-sm text-text-secondary">Email</span>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input className="pl-10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-text-secondary">Пароль</span>
              <div className="relative">
                <KeyRound size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <Input className="pl-10" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Введите пароль" />
              </div>
            </label>

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? 'Входим...' : 'Войти'}
              {!isPending ? <ArrowRight size={16} className="ml-2" /> : null}
            </Button>
            {error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error.message}</div> : null}
          </form>

          <div className="mt-5 space-y-2 text-center text-sm text-text-secondary">
            <Link to="/forgot-password" className="text-primary transition-colors hover:text-white">
              Забыли пароль?
            </Link>
            <div>
              Нет аккаунта?{' '}
              <Link to="/register" className="text-primary transition-colors hover:text-white">
                Регистрация
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
