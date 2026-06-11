import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageIntro, ProfileRow, SectionCard, UserAvatar } from '@/components/app/primitives'
import { useLogout } from '@/hooks'
import { useAuthStore } from '@/store'

const profileSections = [
  { id: 'history', label: 'История заказов', description: 'Все ваши реальные заказы' },
  { id: 'support', label: 'Поддержка', description: 'Связь с командой проекта' },
  { id: 'about', label: 'О приложении', description: 'Текущий статус и информация' },
] as const

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { mutate: logoutRequest, isPending: isLoggingOut } = useLogout()

  return (
    <div className="space-y-4">
      <PageIntro title={user?.name || 'Профиль'} subtitle={user?.company || user?.email} />

      <SectionCard>
        <div className="flex items-center gap-4">
          <UserAvatar name={user?.name} avatar={user?.avatar} size="lg" />
          <div className="flex-1">
            <div className="text-lg font-medium">{user?.name}</div>
            <div className="mt-1 text-sm text-text-secondary">{user?.email}</div>
            <div className="mt-1 text-sm text-text-secondary">{user?.phone}</div>
            <div className="mt-2 inline-flex rounded-full bg-white/[0.04] px-2.5 py-1 text-sm text-text-secondary">
              {user?.role === 'carrier' ? 'Перевозчик' : 'Пользователь'}
            </div>
          </div>
        </div>
      </SectionCard>

      {user?.role === 'carrier' && user.carrierStatus === 'approved' ? (
        <Button className="w-full" onClick={() => navigate('/carrier/profile/edit')}>
          Редактировать профиль перевозчика
        </Button>
      ) : null}

      {user?.carrierStatus !== 'approved' ? (
        <Button className="w-full" onClick={() => navigate('/become-carrier')}>
          Подать заявку перевозчика
        </Button>
      ) : null}

      <SectionCard title="Разделы">
        <div className="space-y-2">
          {profileSections.map((item) => (
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
