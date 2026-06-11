import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { EmptyState, ErrorState, LoadingList } from '@/components/ui/async-state'
import { PageIntro, SectionCard } from '@/components/app/primitives'
import { useCarrierProfile, useUpdateCarrierProfile } from '@/hooks'

export default function CarrierProfileEditPage() {
  const navigate = useNavigate()
  const profileQuery = useCarrierProfile()
  const updateProfile = useUpdateCarrierProfile()
  const profile = profileQuery.data
  const [formData, setFormData] = useState({
    experienceYears: '',
    transportType: '',
    description: '',
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (!profile) return
    setFormData({
      experienceYears: String(profile.experienceYears ?? ''),
      transportType: profile.transportType ?? '',
      description: profile.description ?? '',
    })
  }, [profile])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const experienceYears = Number(formData.experienceYears)
    if (!Number.isFinite(experienceYears) || experienceYears < 0) {
      setFormError('Укажите корректный стаж перевозчика.')
      return
    }

    if (!formData.transportType.trim()) {
      setFormError('Укажите тип перевозок или транспорта.')
      return
    }

    updateProfile.mutate(
      {
        experienceYears,
        transportType: formData.transportType,
        description: formData.description,
      },
      {
        onSuccess: () => navigate('/carrier'),
      },
    )
  }

  return (
    <div className="space-y-4">
      <PageIntro title="Профиль перевозчика" subtitle="Редактирование live данных через backend" />

      {profileQuery.isLoading ? (
        <LoadingList count={2} />
      ) : profileQuery.isError ? (
        <ErrorState onRetry={() => void profileQuery.refetch()} />
      ) : !profile ? (
        <EmptyState title="Профиль не найден" description="Сначала оформите статус перевозчика, затем заполните профиль." />
      ) : (
        <SectionCard>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-text-secondary">
              <div className="font-medium text-white">{profile.user?.company || profile.user?.name || 'Carrier profile'}</div>
              {profile.user?.email ? <div className="mt-1">{profile.user.email}</div> : null}
              {profile.user?.phone ? <div className="mt-1">{profile.user.phone}</div> : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Стаж, лет</span>
                <Input
                  type="number"
                  min="0"
                  value={formData.experienceYears}
                  onChange={(event) => setFormData((prev) => ({ ...prev, experienceYears: event.target.value }))}
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm text-text-secondary">Тип перевозок</span>
                <Input
                  value={formData.transportType}
                  onChange={(event) => setFormData((prev) => ({ ...prev, transportType: event.target.value }))}
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-text-secondary">Описание</span>
              <Textarea
                value={formData.description}
                onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Опишите ваш опыт, направление перевозок и особенности работы"
              />
            </label>

            {formError ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{formError}</div> : null}
            {updateProfile.error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{updateProfile.error.message}</div> : null}

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="secondary" onClick={() => navigate('/carrier')}>
                Назад
              </Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Сохраняем...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </SectionCard>
      )}
    </div>
  )
}
