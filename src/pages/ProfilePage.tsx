import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { PageIntro, ProfileRow, SectionCard } from '@/components/app/primitives'
import { profileMenu } from '@/data/mock'
import { useAuthStore } from '@/store'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout, switchRole } = useAuthStore()

  return (
    <div className="space-y-4">
      <PageIntro title={user?.name || 'Профиль'} subtitle={user?.company} />

      <SectionCard>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-primary/15 text-2xl font-semibold text-primary">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="text-lg font-medium">{user?.name}</div>
            <div className="mt-1 text-sm text-text-secondary">{user?.email}</div>
            <div className="mt-1 text-sm text-text-secondary">{user?.phone}</div>
          </div>
          <div className="rounded-full bg-amber-400/15 px-2.5 py-1 text-sm text-amber-300">{user?.rating}</div>
        </div>
      </SectionCard>

      <SectionCard title="Режим аккаунта">
        <div className="grid grid-cols-2 gap-3">
          <Button variant={user?.role === 'user' ? 'default' : 'secondary'} onClick={() => switchRole('user')}>
            Пользователь
          </Button>
          <Button variant={user?.role === 'carrier' ? 'default' : 'secondary'} onClick={() => switchRole('carrier')}>
            Перевозчик
          </Button>
          <Button variant={user?.role === 'akimat' ? 'default' : 'secondary'} onClick={() => switchRole('akimat')} className="col-span-2">
            Аналитика акимата
          </Button>
        </div>
      </SectionCard>

      {user?.carrierStatus !== 'approved' ? (
        <Button className="w-full" onClick={() => navigate('/become-carrier')}>
          Стать перевозчиком
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

      <Button variant="destructive" className="w-full" onClick={logout}>
        Выйти из аккаунта
      </Button>
    </div>
  )
}
