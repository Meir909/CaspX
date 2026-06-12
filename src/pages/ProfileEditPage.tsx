import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageIntro, SectionCard, UserAvatar } from '@/components/app/primitives'
import { useUploadAvatar } from '@/hooks'
import { useAuthStore } from '@/store'
import { readFileAsDataUrl, resizeImageToFile } from '@/lib/utils'

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const uploadAvatar = useUploadAvatar()
  const [name, setName] = useState(user?.name || '')
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!name.trim()) {
      setError('Введите имя пользователя.')
      return
    }

    updateProfile({ name: name.trim(), avatar: avatarPreview || user?.avatar })
    setError('')
    navigate('/profile')
  }

  return (
    <div className="space-y-4">
      <PageIntro title="Редактирование профиля" subtitle="Можно обновить аватар и имя пользователя." />

      <SectionCard>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex items-center gap-4">
            <UserAvatar name={name || user?.name} avatar={avatarPreview || user?.avatar} size="lg" />
            <label className="flex-1 cursor-pointer rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-white">
                <Camera size={16} className="text-primary" />
                Изменить аватар
              </div>
              <div className="mt-1 text-xs text-text-secondary">Файл будет обрезан и уменьшен перед загрузкой.</div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (event) => {
                  const file = event.target.files?.[0]
                  if (!file) return

                  try {
                    const resized = await resizeImageToFile(file, {
                      width: 720,
                      height: 720,
                      quality: 0.8,
                      fileName: 'avatar.jpg',
                    })
                    const preview = await readFileAsDataUrl(resized)
                    setAvatarPreview(preview)
                    setError('')

                    const result = await uploadAvatar.mutateAsync(resized)
                    updateProfile({
                      avatar: result.url,
                      name,
                    })
                    setAvatarPreview(result.url)
                  } catch (uploadError) {
                    setError(uploadError instanceof Error ? uploadError.message : 'Не удалось загрузить аватар.')
                  }
                }}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-sm text-text-secondary">Имя</span>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-text-secondary">Email</span>
            <Input value={user?.email || ''} readOnly className="text-text-secondary" />
          </label>

          {error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</div> : null}
          {uploadAvatar.error ? <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{uploadAvatar.error.message}</div> : null}

          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="secondary" onClick={() => navigate('/profile')}>
              Назад
            </Button>
            <Button type="submit" disabled={uploadAvatar.isPending}>
              <Save size={16} className="mr-2" />
              Сохранить
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}
