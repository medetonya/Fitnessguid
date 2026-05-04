import { ArrowLeft, PlayCircle, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import { useAuth } from '../hooks/useAuth'
import {
  deleteCustomWorkoutSynced,
  getSavedCustomWorkoutsSynced,
  type SavedCustomWorkout,
} from '../lib/customWorkouts'
import { removeBuilderWorkoutStorage, writeBuilderWorkoutStorage } from '../lib/builderWorkoutStorage'

interface StoredBuilderWorkout {
  selectedExercises: SavedCustomWorkout['selectedExercises']
  executionMode: 'reps' | 'timer'
  sourcePath: string
  createdAt: string
}

type FilterMode = 'all' | 'home' | 'gym'

export default function MyWorkoutsPage() {
  const { language } = useLanguage()
  const { user } = useAuth()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const [savedWorkouts, setSavedWorkouts] = useState<SavedCustomWorkout[]>([])
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [loading, setLoading] = useState(true)
  const [syncError, setSyncError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadWorkouts = async () => {
      if (!user?.id) {
        setSavedWorkouts([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setSyncError(null)
        const workouts = await getSavedCustomWorkoutsSynced(user.id)
        if (!cancelled) {
          setSavedWorkouts(workouts)
        }
      } catch {
        if (!cancelled) {
          setSyncError(isRussian ? 'Не удалось загрузить тренировки. Проверьте интернет и попробуйте снова.' : 'Failed to load workouts. Check your connection and try again.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadWorkouts()

    return () => {
      cancelled = true
    }
  }, [isRussian, user?.id])

  const visibleWorkouts = useMemo(() => {
    if (filterMode === 'all') {
      return savedWorkouts
    }

    return savedWorkouts.filter((workout) => {
      const contextPath = `${workout.sourcePath} ${workout.trainingPath}`.toLowerCase()
      return filterMode === 'home'
        ? contextPath.includes('/workouts/home/')
        : contextPath.includes('/workouts/gym/')
    })
  }, [filterMode, savedWorkouts])

  const handleStartSavedWorkout = (workout: SavedCustomWorkout) => {
    const payload: StoredBuilderWorkout = {
      executionMode: workout.executionMode,
      sourcePath: workout.sourcePath,
      selectedExercises: workout.selectedExercises,
      createdAt: new Date().toISOString(),
    }

    writeBuilderWorkoutStorage(workout.storageKey, JSON.stringify(payload), user?.id)
    navigate(`${workout.trainingPath}?key=${encodeURIComponent(workout.storageKey)}`)
  }

  const handleDelete = async (workout: SavedCustomWorkout) => {
    if (!user?.id) {
      return
    }

    const confirmed = window.confirm(
      isRussian
        ? `Удалить тренировку "${workout.name}"? Это действие нельзя отменить.`
        : `Delete workout "${workout.name}"? This action cannot be undone.`
    )
    if (!confirmed) {
      return
    }

    removeBuilderWorkoutStorage(workout.storageKey, user?.id)
    try {
      setSyncError(null)
      await deleteCustomWorkoutSynced(user.id, workout.id)
      setSavedWorkouts((prev) => prev.filter((item) => item.id !== workout.id))
    } catch {
      setSyncError(isRussian ? 'Не удалось удалить тренировку в облаке. Попробуйте снова.' : 'Failed to delete workout from cloud storage. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-base font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {isRussian ? 'Назад' : 'Back'}
          </Link>
        </div>

        <section className="mb-5 rounded-3xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
          <h1 className="font-serif text-5xl text-[#111111]">{isRussian ? 'Мои тренировки' : 'My Workouts'}</h1>
          <p className="mt-2 text-lg text-[#52525b]">{isRussian ? 'Сохраненные пользовательские тренировки из конструктора.' : 'Saved custom workouts from your builder sessions.'}</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${filterMode === 'all' ? 'bg-[#111111] text-white' : 'border border-[#d4d4d8] bg-white text-[#111111]'}`}
            >
              {isRussian ? 'Все' : 'All'}
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('home')}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${filterMode === 'home' ? 'bg-[#111111] text-white' : 'border border-[#d4d4d8] bg-white text-[#111111]'}`}
            >
              {isRussian ? 'Дом' : 'Home'}
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('gym')}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${filterMode === 'gym' ? 'bg-[#111111] text-white' : 'border border-[#d4d4d8] bg-white text-[#111111]'}`}
            >
              {isRussian ? 'Зал' : 'Gym'}
            </button>
          </div>
        </section>

        {syncError && (
          <section className="mb-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {syncError}
          </section>
        )}

        {loading ? (
          <section className="rounded-3xl border border-[#d4d4d8] bg-white p-6 text-center shadow-sm">
            <p className="text-base font-semibold text-[#111111]">{isRussian ? 'Загружаем тренировки...' : 'Loading workouts...'}</p>
          </section>
        ) : visibleWorkouts.length === 0 ? (
          <section className="rounded-3xl border border-[#d4d4d8] bg-white p-6 text-center shadow-sm">
            <p className="text-base font-semibold text-[#111111]">{isRussian ? 'Пока нет сохраненных тренировок.' : 'No saved workouts yet.'}</p>
            <p className="mt-1 text-sm text-[#52525b]">{isRussian ? 'Создай тренировку в Конструкторе и нажми "Сохранить тренировку".' : 'Create one in Workout Builder and tap Save Workout.'}</p>
          </section>
        ) : (
          <section className="space-y-3">
            {visibleWorkouts.map((workout) => (
              <article key={workout.id} className="rounded-2xl border border-[#d4d4d8] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-[#111111]">{workout.name}</h2>
                    <p className="mt-1 text-sm text-[#52525b]">
                      {workout.selectedExercises.length} {isRussian ? 'упражнений' : 'exercises'} • {workout.modePreset === 'fat-loss' ? (isRussian ? 'Похудение' : 'Fat Loss') : (isRussian ? 'Тонус мышц' : 'Muscle Tone')} • {workout.executionMode === 'timer' ? (isRussian ? 'Таймер' : 'Timer') : (isRussian ? 'Повторения' : 'Reps')}
                    </p>
                    <p className="mt-1 text-xs text-[#71717a]">
                      {isRussian ? 'Сохранено ' : 'Saved '}
                      {new Date(workout.createdAt).toLocaleDateString(isRussian ? 'ru-RU' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartSavedWorkout(workout)}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-3 py-2 text-sm font-semibold text-white"
                    >
                      <PlayCircle size={16} />
                      {isRussian ? 'Старт' : 'Start'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDelete(workout)
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#d4d4d8] bg-white px-3 py-2 text-sm font-semibold text-[#111111]"
                    >
                      <Trash2 size={16} />
                      {isRussian ? 'Удалить' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
