import { Camera, Flame } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../lib/supabase'
import type { UserProgress } from '../types/index'

interface ProgressWithProgram extends UserProgress {
  programName?: string
  programDifficulty?: string
  programDuration?: number
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const MAX_AVATAR_DIMENSION = 1200
const AVATAR_BUCKET = 'profile-avatars'
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/+$/, '')
const avatarUrlCacheKey = (userId: string) => `profile-avatar-url:${userId}`

const getAvatarPublicUrlByUserId = (userId: string) => {
  if (!SUPABASE_URL) {
    return null
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${AVATAR_BUCKET}/${userId}/avatar.jpg`
}

const extractUnknownErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) {
    return error.message
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string' && message.trim().length > 0) {
      return message
    }
  }

  return null
}

const loadImage = (file: File): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
  const objectUrl = URL.createObjectURL(file)
  const image = new Image()

  image.onload = () => {
    URL.revokeObjectURL(objectUrl)
    resolve(image)
  }

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl)
    reject(new Error('Cannot process this image.'))
  }

  image.src = objectUrl
})

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('Cannot compress image.'))
      return
    }
    resolve(blob)
  }, 'image/jpeg', quality)
})

const optimizeAvatarTo2MB = async (file: File): Promise<Blob> => {
  const image = await loadImage(file)
  const maxSide = Math.max(image.width, image.height)
  const ratio = maxSide > MAX_AVATAR_DIMENSION ? MAX_AVATAR_DIMENSION / maxSide : 1

  let width = Math.max(1, Math.round(image.width * ratio))
  let height = Math.max(1, Math.round(image.height * ratio))
  let quality = 0.9

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas is not supported in this browser.')
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = width
    canvas.height = height
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    const blob = await canvasToBlob(canvas, quality)
    if (blob.size <= MAX_AVATAR_BYTES) {
      return blob
    }

    if (quality > 0.6) {
      quality -= 0.1
    } else {
      width = Math.max(240, Math.round(width * 0.85))
      height = Math.max(240, Math.round(height * 0.85))
    }
  }

  throw new Error('Image is too large even after compression. Please choose another photo.')
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const [progress, setProgress] = useState<ProgressWithProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarProcessing, setAvatarProcessing] = useState(false)
  const [checklistHelp, setChecklistHelp] = useState<string | null>(null)
  const [savedName, setSavedName] = useState<string>('')
  const [nameDraft, setNameDraft] = useState('')
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameSaveState, setNameSaveState] = useState<'idle' | 'saving' | 'error'>('idle')
  const [nameError, setNameError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!user) {
      setSavedName('')
      setNameDraft('')
      return
    }

    const initial = user.name?.trim() ?? ''
    setSavedName(initial)
    setNameDraft(initial)
  }, [user])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: progressError } = await supabase
          .from('user_progress')
          .select('id, user_id, program_id, current_day, status, started_at, completed_at, training_programs(name, difficulty, duration)')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })

        if (progressError) {
          throw progressError
        }

        const normalized: ProgressWithProgram[] = (data ?? []).map((row) => {
          const program = Array.isArray(row.training_programs) ? row.training_programs[0] : row.training_programs
          return {
            id: row.id,
            userId: row.user_id,
            programId: row.program_id,
            currentDay: row.current_day,
            status: row.status,
            startedAt: row.started_at,
            completedAt: row.completed_at ?? undefined,
            programName: program?.name,
            programDifficulty: program?.difficulty,
            programDuration: program?.duration,
          }
        })

        setProgress(normalized)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('profile.loadFailed'))
      } finally {
        setLoading(false)
      }
    }

    void fetchProgress()
  }, [user, t])

  useEffect(() => {
    if (!user) {
      setAvatarDataUrl(null)
      setAvatarError(null)
      return
    }

    let cancelled = false

    const loadAvatar = async () => {
      try {
        setAvatarError(null)

        const cachedAvatar = localStorage.getItem(avatarUrlCacheKey(user.id))
        if (cachedAvatar) {
          setAvatarDataUrl(cachedAvatar)
        }

        const { data, error: profileError } = await supabase
          .from('users')
          .select('avatar_url')
          .eq('id', user.id)
          .maybeSingle()

        if (profileError) {
          throw profileError
        }

        const cloudAvatar = data?.avatar_url
        const fallbackAvatar = getAvatarPublicUrlByUserId(user.id)

        let resolvedAvatar: string | null = null
        if (typeof cloudAvatar === 'string' && cloudAvatar.length > 0) {
          resolvedAvatar = cloudAvatar
        } else if (fallbackAvatar) {
          const { data: listed, error: listError } = await supabase.storage
            .from(AVATAR_BUCKET)
            .list(user.id, { limit: 1, search: 'avatar.jpg' })

          if (!listError && Array.isArray(listed) && listed.length > 0) {
            resolvedAvatar = `${fallbackAvatar}?v=${Date.now()}`
          }
        }

        if (!cancelled) {
          if (resolvedAvatar) {
            setAvatarDataUrl(resolvedAvatar)
            localStorage.setItem(avatarUrlCacheKey(user.id), resolvedAvatar)
          } else if (!cachedAvatar) {
            setAvatarDataUrl(null)
          }
        }

        // One-time migration of old local avatar into cloud profile storage.
        const legacyAvatar = localStorage.getItem(`profile-avatar:${user.id}`)
        if (!cloudAvatar && legacyAvatar && legacyAvatar.startsWith('data:image/')) {
          const { error: migrateError } = await supabase
            .from('users')
            .update({ avatar_url: legacyAvatar })
            .eq('id', user.id)

          if (!migrateError && !cancelled) {
            setAvatarDataUrl(legacyAvatar)
          }
        }
      } catch {
        if (!cancelled) {
          const cachedAvatar = localStorage.getItem(avatarUrlCacheKey(user.id))
          if (!cachedAvatar) {
            setAvatarDataUrl(null)
            setAvatarError(t('profile.avatarReadFailed'))
          } else {
            setAvatarError(null)
          }
        }
      }
    }

    void loadAvatar()

    return () => {
      cancelled = true
    }
  }, [user, t])

  const activeCount = progress.filter((item) => item.status === 'active').length
  const completedCount = progress.filter((item) => item.status === 'completed').length
  const pausedCount = progress.filter((item) => item.status === 'paused').length
  const totalPrograms = activeCount + completedCount + pausedCount
  const consistencyScore = totalPrograms > 0 ? Math.round((completedCount / totalPrograms) * 100) : 0
  const latestProgram = progress[0] ?? null
  const currentName = savedName.trim()

  const displayName = useMemo(() => {
    if (!user) return ''
    return currentName || user.email.split('@')[0]
  }, [currentName, user])

  const initials = useMemo(() => {
    const words = displayName.split(/\s+/).map((word) => word.trim()).filter(Boolean)
    const fromWords = words.slice(0, 2).map((word) => word[0]?.toUpperCase() ?? '').join('')
    return fromWords || 'U'
  }, [displayName])

  const joinedDate = useMemo(() => {
    if (!user?.createdAt) return null
    const parsed = new Date(user.createdAt)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', year: 'numeric' })
  }, [user?.createdAt, language])

  const accessInfo = useMemo(() => {
    if (!user) return { expiresLabel: t('profile.notSet'), daysLeftLabel: t('profile.notSet'), expired: false }
    if (user.role === 'admin') {
      return {
        expiresLabel: t('profile.accessUnlimitedAdmin'),
        daysLeftLabel: t('profile.accessUnlimited'),
        expired: false,
      }
    }
    if (!user.accessExpiresAt) return { expiresLabel: t('profile.notSet'), daysLeftLabel: t('profile.notSet'), expired: false }

    const expiresAt = new Date(user.accessExpiresAt)
    if (Number.isNaN(expiresAt.getTime())) {
      return { expiresLabel: t('profile.accessInvalidDate'), daysLeftLabel: t('profile.accessUnknown'), expired: false }
    }

    const now = new Date()
    const diffMs = expiresAt.getTime() - now.getTime()
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    const expired = daysLeft < 0

    return {
      expiresLabel: expiresAt.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysLeftLabel: expired
        ? t('profile.accessExpired')
        : `${daysLeft} ${daysLeft === 1 ? t('profile.accessDayLeft') : t('profile.accessDaysLeft')}`,
      expired,
    }
  }, [user, t, language])

  const getRoleLabel = (role: string) => {
    if (role === 'admin') return t('profile.roleAdmin')
    if (role === 'user') return t('profile.roleUser')
    return role
  }

  const getStatusLabel = (status: string) => {
    if (status === 'approved') return t('profile.statusApproved')
    if (status === 'pending') return t('profile.statusPending')
    if (status === 'active') return t('profile.statusActive')
    if (status === 'completed') return t('profile.statusCompleted')
    if (status === 'paused') return t('profile.statusPaused')
    return status
  }

  const profileCompletion = useMemo(() => {
    if (!user) return 0
    const checks = [
      Boolean(currentName),
      Boolean(avatarDataUrl),
      progress.length > 0,
      user.status === 'approved',
      user.role === 'admin' || Boolean(user.accessExpiresAt),
    ]
    return Math.round((checks.filter(Boolean).length / checks.length) * 100)
  }, [user, currentName, avatarDataUrl, progress.length])

  const profileChecklist = useMemo(() => {
    if (!user) return []

    return [
      {
        key: 'name',
        label: t('profile.checklistNameLabel'),
        hint: currentName ? t('profile.checklistNameDone') : t('profile.checklistNameHint'),
        done: Boolean(currentName),
      },
      {
        key: 'avatar',
        label: t('profile.checklistAvatarLabel'),
        hint: avatarDataUrl ? t('profile.checklistAvatarDone') : t('profile.checklistAvatarHint'),
        done: Boolean(avatarDataUrl),
      },
      {
        key: 'training',
        label: t('profile.checklistTrainingLabel'),
        hint: progress.length > 0 ? t('profile.checklistTrainingDone') : t('profile.checklistTrainingHint'),
        done: progress.length > 0,
      },
      {
        key: 'approval',
        label: t('profile.checklistApprovalLabel'),
        hint: user.status === 'approved' ? t('profile.checklistApprovalDone') : t('profile.checklistApprovalHint'),
        done: user.status === 'approved',
      },
      {
        key: 'access',
        label: t('profile.checklistAccessLabel'),
        hint: user.role === 'admin' || Boolean(user.accessExpiresAt)
          ? t('profile.checklistAccessDone')
          : t('profile.checklistAccessHint'),
        done: user.role === 'admin' || Boolean(user.accessExpiresAt),
      },
    ]
  }, [user, currentName, avatarDataUrl, progress.length, t])

  const remainingChecklistItems = profileChecklist.filter((item) => !item.done)

  const primaryProgram = useMemo(() => {
    return progress.find((item) => item.status === 'active') ?? latestProgram
  }, [progress, latestProgram])

  const primaryProgramPercent = useMemo(() => {
    if (!primaryProgram?.programDuration) return null
    return Math.min(100, Math.max(0, Math.round((primaryProgram.currentDay / primaryProgram.programDuration) * 100)))
  }, [primaryProgram])

  const activityStreak = useMemo(() => {
    const uniqueDays = new Set<string>()

    for (const item of progress) {
      const sourceDate = item.completedAt ?? item.startedAt
      if (!sourceDate) continue

      const parsed = new Date(sourceDate)
      if (Number.isNaN(parsed.getTime())) continue
      uniqueDays.add(parsed.toISOString().slice(0, 10))
    }

    if (uniqueDays.size === 0) return 0

    const sortedDays = [...uniqueDays]
      .map((value) => new Date(value))
      .sort((a, b) => b.getTime() - a.getTime())

    let streak = 1
    for (let index = 1; index < sortedDays.length; index += 1) {
      const prev = sortedDays[index - 1]
      const current = sortedDays[index]
      const diffDays = Math.round((prev.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays !== 1) break
      streak += 1
    }

    return streak
  }, [progress])

  const openAvatarPicker = () => {
    setChecklistHelp(null)
    fileInputRef.current?.click()
  }

  const handleChecklistAction = (key: string) => {
    if (key === 'avatar') {
      openAvatarPicker()
      return
    }

    if (key === 'training') {
      setChecklistHelp(null)
      navigate('/workouts/home/progress')
      return
    }

    if (key === 'approval') {
      setChecklistHelp(t('profile.approvalHelp'))
      return
    }

    if (key === 'access') {
      setChecklistHelp(t('profile.accessHelp'))
      return
    }

    if (key === 'name') {
      setChecklistHelp(null)
      setIsEditingName(true)
      setNameError(null)
    }
  }

  const saveName = async () => {
    if (!user) {
      return
    }

    const trimmed = nameDraft.trim()
    if (!trimmed) {
      setNameSaveState('error')
      setNameError(t('profile.nameRequired'))
      return
    }

    try {
      setNameSaveState('saving')
      setNameError(null)

      const { error: updateError } = await supabase
        .from('users')
        .update({ name: trimmed })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      setSavedName(trimmed)
      setNameDraft(trimmed)
      setIsEditingName(false)
      setNameSaveState('idle')
    } catch {
      setNameSaveState('error')
      setNameError(t('profile.nameUpdateFailed'))
    }
  }

  const onAvatarSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    setAvatarError(null)
    setError(null)

    if (!file.type.startsWith('image/')) {
      setAvatarError(t('profile.unsupportedFile'))
      return
    }

    event.target.value = ''

    const saveAvatar = async () => {
      try {
        setAvatarProcessing(true)
        const optimized = await optimizeAvatarTo2MB(file)
        const avatarPath = `${user.id}/avatar.jpg`

        const { error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(avatarPath, optimized, {
            upsert: true,
            contentType: 'image/jpeg',
            cacheControl: '3600',
          })

        if (uploadError) {
          const message = `${uploadError.message ?? ''} ${uploadError.name ?? ''}`.toLowerCase()
          if (message.includes('bucket') || message.includes('not found')) {
            throw new Error(t('profile.avatarStorageUnavailable'))
          }
          throw uploadError
        }

        const { data: publicData } = supabase.storage
          .from(AVATAR_BUCKET)
          .getPublicUrl(avatarPath)

        const avatarUrl = publicData.publicUrl || getAvatarPublicUrlByUserId(user.id)
        if (!avatarUrl) {
          throw new Error(t('profile.avatarSaveFailed'))
        }

        const { error: updateError } = await supabase
          .from('users')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id)

        if (updateError) {
          // Avatar file is already stored by user-specific path, so keep UI success and only log profile URL write issue.
          console.warn('Avatar URL update skipped:', updateError)
        }

        const stableAvatarUrl = `${avatarUrl}?v=${Date.now()}`
        setAvatarDataUrl(stableAvatarUrl)
        localStorage.setItem(avatarUrlCacheKey(user.id), stableAvatarUrl)
        setAvatarError(null)
      } catch (uploadError) {
        const message = extractUnknownErrorMessage(uploadError)
        if (message) {
          setAvatarError(message)
        } else {
          setAvatarError(t('profile.avatarSaveFailed'))
        }
      } finally {
        setAvatarProcessing(false)
      }
    }

    void saveAvatar()
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-7">
        <section className="app-hero fade-up mb-3 border border-[#f3d0e1] bg-gradient-to-br from-white to-[#fff7fb]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openAvatarPicker}
                className="group relative h-16 w-16 overflow-hidden rounded-full border border-[#f3d0e1] bg-white"
                aria-label={t('profile.avatarUploadAria')}
              >
                {avatarDataUrl ? (
                  <img
                    src={avatarDataUrl}
                    alt={t('profile.avatarAlt')}
                    className="h-full w-full object-cover"
                    onError={() => {
                      setAvatarError(t('profile.avatarDisplayFailed'))
                    }}
                  />
                ) : (
                  <span className="inline-flex h-full w-full items-center justify-center text-lg font-bold text-[#be185d]">{initials}</span>
                )}
                <span className="absolute inset-x-0 bottom-0 inline-flex items-center justify-center gap-1 bg-black/55 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera size={11} />
                  {t('profile.photoButton')}
                </span>
              </button>

              <div>
                <h1 className="font-serif text-3xl text-[#111111] sm:text-4xl">{displayName}</h1>
                {joinedDate && <p className="mt-0.5 text-xs text-[#71717a]">{t('profile.joinedPrefix')} {joinedDate}</p>}
                <div className="mt-1.5 inline-flex items-center gap-2 rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#be185d]">
                  <Flame size={12} />
                  <span>{activityStreak}</span>
                  <span>{t('profile.statConsistency')}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white px-3 py-2 text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a]">{t('profile.profileLabel')}</p>
              <p className="mt-0.5 text-3xl font-extrabold leading-none text-[#111111]">{profileCompletion}%</p>
            </div>
          </div>

          <div className="mt-3 h-3.5 w-full overflow-hidden rounded-full bg-[#f3d0e1]/45">
            <div className="h-full rounded-full bg-[#be185d] transition-all" style={{ width: `${profileCompletion}%` }} />
          </div>

          {avatarProcessing && <p className="mt-2 text-xs font-medium text-[#52525b]">{t('profile.avatarProcessing')}</p>}
          {avatarError && !avatarDataUrl && <p className="mt-2 text-xs font-medium text-red-600">{avatarError}</p>}

          <input ref={fileInputRef} type="file" accept="image/*" onChange={onAvatarSelected} className="hidden" />
        </section>

        <section className="app-card-soft fade-up mb-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="px-1 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a]">{t('profile.statActive')}</p>
              <p className="mt-0.5 text-xl font-bold text-[#111111]">{activeCount}</p>
            </div>
            <div className="px-1 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a]">{t('profile.statDone')}</p>
              <p className="mt-0.5 text-xl font-bold text-[#111111]">{completedCount}</p>
            </div>
            <div className="px-1 py-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#71717a]">{t('profile.statConsistency')}</p>
              <p className="mt-0.5 text-xl font-bold text-[#111111]">{consistencyScore}%</p>
            </div>
          </div>
        </section>

        <section className="app-card-soft fade-up mb-3">
          {remainingChecklistItems.length > 0 ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#be185d]">{t('profile.checklistTitle')}</p>
              <ul className="mt-2 space-y-1 text-xs text-[#52525b]">
                {remainingChecklistItems.map((item) => (
                  <li key={item.key} className="flex items-center justify-between gap-2">
                    <span className="truncate">
                      <span className="font-semibold text-[#111111]">{item.label}:</span> {item.hint}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleChecklistAction(item.key)}
                      className="shrink-0 rounded-md border border-[#f3d0e1] bg-white px-2 py-1 text-[11px] font-semibold text-[#be185d]"
                    >
                      {t('profile.checklistOpen')}
                    </button>
                  </li>
                ))}
              </ul>

              {checklistHelp && <div className="mt-2 rounded-md bg-white px-2.5 py-2 text-[11px] text-[#52525b]">{checklistHelp}</div>}
            </div>
          ) : (
            <p className="rounded-lg bg-[#f0fdf4] px-3 py-2 text-xs font-semibold text-[#166534]">{t('profile.profileCompleted')}</p>
          )}
        </section>

        <section className="app-card-soft fade-up mb-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="font-serif text-2xl text-[#111111]">{t('profile.trainingTitle')}</h2>
            {primaryProgram && <span className="rounded-full bg-[#fff1f7] px-2.5 py-1 text-[11px] font-semibold text-[#be185d]">{getStatusLabel(primaryProgram.status)}</span>}
          </div>

          {loading && <p className="text-sm text-gray-600">{t('profile.loadingProgress')}</p>}
          {!loading && error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

          {!loading && !error && progress.length === 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{t('profile.noPrograms')}</p>
            </div>
          )}

          {!loading && !error && primaryProgram && (
            <div className="space-y-3">
              <div>
                <p className="text-base font-semibold text-[#111111]">{primaryProgram.programName ?? t('profile.programFallback')}</p>
                <p className="mt-1 text-xs text-[#71717a]">
                  {t('profile.dayLabel')} {primaryProgram.currentDay}{primaryProgram.programDuration ? ` ${t('profile.ofLabel')} ${primaryProgram.programDuration}` : ''}
                </p>
              </div>

              {primaryProgramPercent !== null && (
                <>
                  <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#f3d0e1]/45">
                    <div className="h-full rounded-full bg-[#be185d]" style={{ width: `${primaryProgramPercent}%` }} />
                  </div>
                  <p className="text-xs font-semibold text-[#71717a]">{primaryProgramPercent}{t('profile.completeSuffix')}</p>
                </>
              )}
            </div>
          )}
        </section>

        <section className="app-card-soft fade-up">
          <h2 className="font-serif text-2xl text-[#111111]">{t('profile.accountTitle')}</h2>
          <div className="mt-3 divide-y divide-gray-100 text-sm">
            <div className="flex items-start justify-between gap-2 py-2">
              <span className="text-gray-500">{t('profile.accountName')}</span>
              <div className="text-right font-medium text-gray-900">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={nameDraft}
                      onChange={(event) => {
                        setNameDraft(event.target.value)
                        if (nameSaveState === 'error') {
                          setNameSaveState('idle')
                          setNameError(null)
                        }
                      }}
                      className="w-36 rounded-lg border border-[#d4d4d8] bg-white px-2 py-1 text-sm"
                      placeholder={t('profile.nameInputPlaceholder')}
                      maxLength={60}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void saveName()
                      }}
                      disabled={nameSaveState === 'saving'}
                      className="rounded-lg px-1.5 py-1 text-xs font-semibold text-[#111111] underline decoration-[#111111] underline-offset-2 disabled:opacity-60"
                    >
                      {nameSaveState === 'saving' ? t('profile.savingName') : t('profile.saveName')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false)
                        setNameDraft(savedName)
                        setNameSaveState('idle')
                        setNameError(null)
                      }}
                      className="rounded-lg px-1.5 py-1 text-xs font-semibold text-[#71717a] underline decoration-[#71717a] underline-offset-2"
                    >
                      {t('profile.cancelNameEdit')}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{currentName || t('profile.notSet')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(true)
                        setNameError(null)
                      }}
                      className="rounded-lg px-1.5 py-1 text-xs font-semibold text-[#111111] underline decoration-[#111111] underline-offset-2"
                    >
                      {t('profile.editName')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {nameError && <p className="py-2 text-right text-xs text-red-700">{nameError}</p>}

            <div className="flex items-center justify-between gap-2 py-2">
              <span className="text-gray-500">{t('profile.accountEmail')}</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>

            <div className="flex items-center justify-between gap-2 py-2">
              <span className="text-gray-500">{t('profile.accountRole')}</span>
              <span className="font-medium capitalize text-gray-900">{getRoleLabel(user.role)}</span>
            </div>

            <div className="flex items-center justify-between gap-2 py-2">
              <span className="text-gray-500">{t('profile.planTitle')}</span>
              <span className={`font-medium ${accessInfo.expired ? 'text-red-600' : 'text-gray-900'}`}>{accessInfo.daysLeftLabel}</span>
            </div>

            <div className="flex items-center justify-between gap-2 py-2">
              <span className="text-gray-500">{t('profile.accessUntil')}</span>
              <span className={`font-medium ${accessInfo.expired ? 'text-red-600' : 'text-gray-900'}`}>{accessInfo.expiresLabel}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
