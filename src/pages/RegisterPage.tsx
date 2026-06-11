import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, Mail, Phone, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthShell } from '@/components/app/auth-shell'
import { useRegister } from '@/hooks'
import { useAuthStore } from '@/store'

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { mutate, isPending } = useRegister()
  const [formData, setFormData] = useState({
    name: 'Алишер А.',
    email: 'alisher@caspx.kz',
    phone: '+7 701 123 45 67',
    password: '12345678',
  })

  return (
    <AuthShell
      title="Регистрация"
      subtitle="Создайте аккаунт, чтобы оформлять перевозки, отслеживать грузы и общаться с перевозчиками."
    >
      <Card>
        <CardHeader>
          <CardTitle>Создать аккаунт</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              mutate(formData, {
                onSuccess: (user) => {
                  login(user)
                  navigate('/')
                },
              })
            }}
          >
            <AuthField icon={<UserRound size={16} />} label="Имя">
              <Input value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Ваше имя" className="pl-10" />
            </AuthField>

            <AuthField icon={<Mail size={16} />} label="Email">
              <Input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="name@company.com" className="pl-10" />
            </AuthField>

            <AuthField icon={<Phone size={16} />} label="Телефон">
              <Input value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} placeholder="+7 700 000 00 00" className="pl-10" />
            </AuthField>

            <AuthField icon={<LockKeyhole size={16} />} label="Пароль">
              <Input type="password" value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder="Придумайте пароль" className="pl-10" />
            </AuthField>

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? 'Создаем...' : 'Зарегистрироваться'}
              {!isPending ? <ArrowRight size={16} className="ml-2" /> : null}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-text-secondary">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary transition-colors hover:text-white">
              Войти
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}

function AuthField({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">{icon}</div>
        {children}
      </div>
    </label>
  )
}
