import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Copy, MailCheck, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthShell } from '@/components/app/auth-shell'
import { useForgotPassword } from '@/hooks'

type ResetDelivery = {
  email: string
  mailtoLink: string
  resetLink: string
  expiresAt: string
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('alisher@caspx.kz')
  const [delivery, setDelivery] = useState<ResetDelivery | null>(null)
  const [copied, setCopied] = useState(false)
  const { mutate, isPending, error } = useForgotPassword()

  return (
    <AuthShell
      title="Восстановление доступа"
      subtitle="Введите email аккаунта. Мы подготовим письмо со ссылкой для смены пароля и открытия страницы сброса."
    >
      <Card>
        <CardHeader>
          <CardTitle>{delivery ? 'Ссылка подготовлена' : 'Введите email'}</CardTitle>
        </CardHeader>
        <CardContent>
          {delivery ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/[0.03] p-4 text-sm leading-6 text-text-secondary">
                Письмо для <span className="text-white">{delivery.email}</span> подготовлено. Ссылка действует до{' '}
                <span className="text-white">{new Date(delivery.expiresAt).toLocaleString('ru-RU')}</span>.
              </div>

              <a href={delivery.mailtoLink} className="block">
                <Button className="w-full">
                  <Send size={16} className="mr-2" />
                  Открыть почтовое приложение
                </Button>
              </a>

              <Button
                variant="secondary"
                className="w-full"
                onClick={async () => {
                  await navigator.clipboard.writeText(delivery.resetLink)
                  setCopied(true)
                }}
              >
                <Copy size={16} className="mr-2" />
                {copied ? 'Ссылка скопирована' : 'Скопировать ссылку сброса'}
              </Button>

              <Link to="/login" className="block">
                <Button variant="secondary" className="w-full">
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
                  onSuccess: (result) => {
                    setDelivery(result)
                    setCopied(false)
                  },
                })
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm text-text-secondary">Email</span>
                <div className="relative">
                  <MailCheck size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <Input
                    className="pl-10"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
              </label>

              <Button className="w-full" type="submit" disabled={isPending}>
                {isPending ? 'Подготавливаем...' : 'Отправить письмо'}
                {!isPending ? <Send size={16} className="ml-2" /> : null}
              </Button>

              {error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error.message}</div> : null}
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
