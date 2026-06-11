import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MailCheck, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthShell } from '@/components/app/auth-shell'
import { useForgotPassword } from '@/hooks'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('alisher@caspx.kz')
  const [sent, setSent] = useState(false)
  const { mutate, isPending } = useForgotPassword()

  return (
    <AuthShell
      title="Восстановление доступа"
      subtitle="Введите email аккаунта. Мы отправим ссылку для смены пароля и возврата в кабинет."
    >
      <Card>
        <CardHeader>
          <CardTitle>{sent ? 'Письмо отправлено' : 'Введите email'}</CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/[0.03] p-4 text-sm leading-6 text-text-secondary">
                Ссылка на восстановление пароля отправлена на <span className="text-white">{email}</span>.
              </div>
              <Link to="/login" className="block">
                <Button className="w-full">
                  <ArrowLeft size={16} className="mr-2" />
                  Вернуться ко входу
                </Button>
              </Link>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault()
                mutate(email, {
                  onSuccess: () => setSent(true),
                })
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm text-text-secondary">Email</span>
                <div className="relative">
                  <MailCheck size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <Input className="pl-10" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@company.com" />
                </div>
              </label>

              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? 'Отправляем...' : 'Отправить ссылку'}
                {!isPending ? <Send size={16} className="ml-2" /> : null}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
