import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AtSign, Building2, ImageUp, PhoneCall, Save, UserRoundCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageIntro, ProfileRow, SectionCard, UserAvatar } from '@/components/app/primitives'
import { profileMenu } from '@/data/mock'
import { useLogout } from '@/hooks'
import { cropAndResizeImage } from '@/lib/utils'
import { useAuthStore } from '@/store'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, switchRole, updateProfile } = useAuthStore()
  const { mutate: logoutRequest, isPending: isLoggingOut } = useLogout()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  })

  useEffect(() => {
    setFormData({
      name: user?.name || '',
      company: user?.company || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    })
  }, [user])

  return (
    <div className="space-y-4">
      <PageIntro
        title={user?.name || 'Профиль'}
        subtitle={user?.company}
        action={
          <Button variant="secondary" size="sm" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? 'Отмена' : 'Редактировать'}
          </Button>
        }
      />

      <SectionCard>
        <div className="flex items-center gap-4">
          <div className="space-y-3">
            <UserAvatar name={formData.name} avatar={formData.avatar} size="lg" />
            {isEditing ? (
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-white/[0.04] px-3 py-2 text-xs text-text-secondary">
                <ImageUp size={14} />
                Изменить фото
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    const avatar = await cropAndResizeImage(file, { width: 512, height: 512, quality: 0.9 })
                    setFormData((prev) => ({ ...prev, avatar }))
                  }}
                />
              </label>
            ) : null}
          </div>

          <div className="flex-1">
            <div className="text-lg font-medium">{user?.name}</div>
            <div className="mt-1 text-sm text-text-secondary">{user?.email}</div>
            <div className="mt-1 text-sm text-text-secondary">{user?.phone}</div>
            <div className="mt-2 inline-flex rounded-full bg-amber-400/15 px-2.5 py-1 text-sm text-amber-300">
              Рейтинг {user?.rating}
            </div>
          </div>
        </div>
      </SectionCard>

      {isEditing ? (
        <SectionCard title="Редактирование профиля">
          <div className="space-y-3">
            <Field label="Имя" icon={<UserRoundCog size={16} />}>
              <Input
                className="pl-10"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Field>
            <Field label="Компания" icon={<Building2 size={16} />}>
              <Input
                className="pl-10"
                value={formData.company}
                onChange={(event) => setFormData((prev) => ({ ...prev, company: event.target.value }))}
              />
            </Field>
            <Field label="Email" icon={<AtSign size={16} />}>
              <Input
                className="pl-10"
                value={formData.email}
                onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
              />
            </Field>
            <Field label="Телефон" icon={<PhoneCall size={16} />}>
              <Input
                className="pl-10"
                value={formData.phone}
                onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </Field>
            <Button
              className="w-full"
              onClick={() => {
                updateProfile(formData)
                setIsEditing(false)
              }}
            >
              <Save size={16} className="mr-2" />
              Сохранить изменения
            </Button>
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Режим аккаунта">
        <div className="grid grid-cols-2 gap-3">
          <Button variant={user?.role === 'user' ? 'default' : 'secondary'} onClick={() => switchRole('user')}>
            Пользователь
          </Button>
          <Button variant={user?.role === 'carrier' ? 'default' : 'secondary'} onClick={() => switchRole('carrier')}>
            Перевозчик
          </Button>
          <Button
            variant={user?.role === 'akimat' ? 'default' : 'secondary'}
            onClick={() => switchRole('akimat')}
            className="col-span-2"
          >
            Аналитика акимата
          </Button>
        </div>
      </SectionCard>

      {user?.carrierStatus !== 'approved' ? (
        <Button className="w-full" onClick={() => navigate('/become-carrier')}>
          Сначала заполните заявку перевозчика
        </Button>
      ) : null}

      <SectionCard title="Разделы">
        <div className="space-y-2">
          {profileMenu.map((item) => (
            <button key={item.id} type="button" onClick={() => navigate(`/${item.id}`)} className="w-full text-left">
              <ProfileRow title={item.label} description={item.description} />
            </button>
          ))}
        </div>
      </SectionCard>

      <Button
        variant="destructive"
        className="w-full"
        disabled={isLoggingOut}
        onClick={() => {
          logoutRequest(undefined, {
            onSettled: () => {
              logout()
              navigate('/login')
            },
          })
        }}
      >
        {isLoggingOut ? 'Выходим...' : 'Выйти из аккаунта'}
      </Button>
    </div>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon: ReactNode
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
