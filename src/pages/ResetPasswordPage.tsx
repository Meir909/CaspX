import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthShell } from '@/components/app/auth-shell'
import { useResetPassword } from '@/hooks'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const [completed, setCompleted] = useState(false)
  const { mutate, isPending, error } = useResetPassword()

  const tokenMissing = useMemo(() => token.trim().length === 0, [token])

  return (
    <AuthShell
      title="Новый пароль"
      subtitle="Установите новый пароль для аккаунта CaspX по ссылке из письма."
    >
      <Card>
        <CardHeader>
          <CardTitle>{completed ? 'Пароль обновлён' : 'Сброс пароля'}</CardTitle>
        </CardHeader>
        <CardContent>
          {completed ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-200">
                Новый пароль сохранён. Теперь можно войти в аккаунт с обновлёнными данными.
              </div>
              <Button className="w-full" onClick={() => navigate('/login')}>
                <ShieldCheck size={16} className="mr-2" />
                Перейти ко входу
              </Button>
            </div>
          ) : tokenMissing ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-rose-500/10 p-4 text-sm leading-6 text-rose-300">
                В ссылке отсутствует токен сброса. Запросите восстановление пароля заново.
              </div>
              <Link to="/forgot-password" className="block">
                <Button className="w-full">Запросить новую ссылку</Button>
              </Link>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()

                if (password.length < 8) {
                  setLocalError('Пароль должен содержать минимум 8 символов.')
                  return
                }

                if (password !== confirmPassword) {
                  setLocalError('Пароли не совпадают.')
                  return
                }

                setLocalError('')
                mutate(
                  { token, password },
                  {
                    onSuccess: () => setCompleted(true),
                  },
                )
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm text-text-secondary">Новый пароль</span>
                <div className="relative">
                  <KeyRound size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <Input
                    className="pl-10"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Введите новый пароль"
                  />
                </div>
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-text-secondary">Повторите пароль</span>
                <div className="relative">
                  <KeyRound size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <Input
                    className="pl-10"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Повторите новый пароль"
                  />
                </div>
              </label>

              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? 'Сохраняем...' : 'Сохранить новый пароль'}
                {!isPending ? <ArrowRight size={16} className="ml-2" /> : null}
              </Button>

              {localError ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{localError}</div> : null}
              {error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error.message}</div> : null}
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
