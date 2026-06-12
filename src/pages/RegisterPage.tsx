import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthShell } from '@/components/app/auth-shell'
import { useRegister } from '@/hooks'
import { useAuthStore } from '@/store'
import { PhoneInput, normalizePhoneValue } from '@/components/ui/phone-input'
import type { UserRole } from '@/types'

type RegisterRole = Extract<UserRole, 'user' | 'carrier'>

const roleOptions: Array<{
  value: RegisterRole
  label: string
  description: string
}> = [
  {
    value: 'user',
    label: 'Заказчик',
    description: 'Создание заказов и контроль своих перевозок.',
  },
  {
    value: 'carrier',
    label: 'Перевозчик',
    description: 'Регистрация перевозчика и работа с доступными заказами после одобрения.',
  },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const { mutate, isPending, error } = useRegister()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '+7',
    password: '',
    role: 'user' as RegisterRole,
  })

  return (
    <AuthShell
      title="Регистрация"
      subtitle="Создайте реальный аккаунт, который работает через backend API и готов к дальнейшей интеграции роли."
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
              mutate(
                {
                  ...formData,
                  phone: normalizePhoneValue(formData.phone),
                },
                {
                  onSuccess: (user) => {
                    login(user)
                    navigate(formData.role === 'carrier' ? '/become-carrier' : '/')
                  },
                },
              )
            }}
          >
            <AuthField icon={<UserRound size={16} />} label="Имя">
              <Input
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="Ваше имя"
                className="pl-10"
              />
            </AuthField>

            <AuthField icon={<Mail size={16} />} label="Email">
              <Input
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                placeholder="name@company.com"
                className="pl-10"
              />
            </AuthField>

            <label className="block space-y-2">
              <span className="text-sm text-text-secondary">Телефон</span>
              <PhoneInput value={formData.phone} onChange={(phone) => setFormData((prev) => ({ ...prev, phone }))} />
            </label>

            <div className="space-y-2">
              <span className="text-sm text-text-secondary">Роль</span>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: role.value }))}
                    className={
                      formData.role === role.value
                        ? 'rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-left'
                        : 'rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-text-secondary'
                    }
                  >
                    <div className="font-medium text-white">{role.label}</div>
                    <div className="mt-1 text-xs leading-5 text-text-secondary">{role.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <AuthField icon={<LockKeyhole size={16} />} label="Пароль">
              <Input
                type="password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                placeholder="Придумайте пароль"
                className="pl-10"
              />
            </AuthField>

            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? 'Создаем...' : 'Зарегистрироваться'}
              {!isPending ? <ArrowRight size={16} className="ml-2" /> : null}
            </Button>

            {error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error.message}</div> : null}
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
