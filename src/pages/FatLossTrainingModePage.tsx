import { ArrowLeft, ChevronLeft, ChevronRight, House, Pause, PlayCircle, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import ExerciseVideo from '../components/ExerciseVideo'
import PostWorkoutMotivationCard from '../components/PostWorkoutMotivationCard'
import TechniqueQuickCard from '../components/TechniqueQuickCard'
import { getExerciseInfo } from '../data/exerciseInfoLibrary'
import { getFatLossReadyWorkoutDay } from '../data/fatLossReadyWorkouts'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { localizeExerciseName, localizeExerciseZone, localizeRepsText, localizeTechniqueText } from '../lib/exerciseTextLocalization'
import { incrementMotivationProgress } from '../lib/motivationProgress'
import { recordWorkoutSession } from '../lib/workoutSessions'
import { getWorkoutNoteByKey, upsertWorkoutNote } from '../lib/workoutNotes'

const formatSeconds = (value: number) => {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const parseExerciseWorkSeconds = (reps: string): number => {
  const match = reps.match(/(\d+)\s*(sec|сек)/i)
  if (!match) {
    return 40
  }

  const value = Number(match[1])
  return Number.isFinite(value) && value > 0 ? value : 40
}

export default function FatLossTrainingModePage() {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const { dayId } = useParams()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const goalBasePath = isGymRoute ? '/workouts/gym/goal/fat-loss' : '/workouts/home/goal/fat-loss'
  const day = getFatLossReadyWorkoutDay(dayId, isGymRoute ? 'gym' : 'home')
  const backToSheetPath = dayId ? `${goalBasePath}/ready-workout/sheet/${dayId}` : `${goalBasePath}/ready-workout`
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [isFinished, setIsFinished] = useState(false)
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [exerciseCountdown, setExerciseCountdown] = useState(() => {
    const firstReps = day?.exercises[0]?.reps
    return firstReps ? parseExerciseWorkSeconds(firstReps) : 40
  })
  const [motivationWorkoutNumber, setMotivationWorkoutNumber] = useState<number | null>(null)
  const [completedExerciseIndexes, setCompletedExerciseIndexes] = useState<Set<string>>(new Set())
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({})
  const [noteSaveState, setNoteSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const current = useMemo(() => {
    if (!day) return null
    return day.exercises[currentIndex]
  }, [day, currentIndex])

  const currentDisplayName = current ? localizeExerciseName(current.name, language) : ''
  const currentDisplayZone = current ? localizeExerciseZone(current.zone, language) : ''
  const currentTechnique = useMemo(() => {
    if (!current) {
      return undefined
    }

    const info = getExerciseInfo(current.name, current.zone, current.tag)
    return localizeTechniqueText(info.technique, current.tag, current.name, language)
  }, [current, language])

  const noteKey = day && current ? `fat-loss:${day.id}:${currentIndex}:${current.name}` : null
  const noteText = noteKey ? (noteDrafts[noteKey] ?? savedNotes[noteKey] ?? '') : ''
  const currentExerciseWorkSeconds = current ? parseExerciseWorkSeconds(current.reps) : 40
  const hasTimedWork = Boolean(current?.reps && /\b(sec|сек)\b/i.test(current.reps))

  const getExerciseWorkSecondsByIndex = (index: number) => {
    if (!day) {
      return 40
    }

    return parseExerciseWorkSeconds(day.exercises[index]?.reps ?? '40 sec')
  }

  useEffect(() => {
    if (!noteKey || !user?.id) {
      return
    }

    let cancelled = false

    const loadSavedNote = async () => {
      const note = await getWorkoutNoteByKey(noteKey, user.id)
      if (cancelled || !note) {
        return
      }

      setSavedNotes((prev) => ({
        ...prev,
        [noteKey]: note.noteText,
      }))
    }

    loadSavedNote()

    return () => {
      cancelled = true
    }
  }, [noteKey, user?.id])

  const collectCircuitNoteEntries = () => {
    if (!day) {
      return []
    }

    return day.exercises
      .map((exercise, index) => {
        const key = `fat-loss:${day.id}:${index}:${exercise.name}`
        const note = (noteDrafts[key] ?? savedNotes[key] ?? '').trim()
        if (!note) {
          return null
        }

        return {
          key,
          exerciseName: exercise.name,
          note,
        }
      })
      .filter((item): item is { key: string; exerciseName: string; note: string } => Boolean(item))
  }

  const saveAllCircuitNotes = async () => {
    if (!user || !day) {
      return
    }

    const entries = collectCircuitNoteEntries()
    if (entries.length === 0) {
      return
    }

    await Promise.allSettled(
      entries.map((entry) =>
        upsertWorkoutNote({
          userId: user.id,
          key: entry.key,
          source: 'fat-loss',
          programLabel: isRussian ? `Похудение день ${day.dayNumber}` : `Fat loss day ${day.dayNumber}`,
          exerciseName: entry.exerciseName,
          noteText: entry.note,
        })
      )
    )
  }

  const saveCurrentNote = async () => {
    if (!user || !noteKey || !day || !current) {
      return
    }

    const trimmed = noteText.trim()
    if (!trimmed) {
      setNoteSaveState('error')
      return
    }

    setNoteSaveState('saving')

    try {
      await upsertWorkoutNote({
        userId: user.id,
        key: noteKey,
        source: 'fat-loss',
        programLabel: isRussian ? `Похудение день ${day.dayNumber}` : `Fat loss day ${day.dayNumber}`,
        exerciseName: current.name,
        noteText: trimmed,
      })

      setSavedNotes((prev) => ({
        ...prev,
        [noteKey]: trimmed,
      }))
      setNoteSaveState('saved')
    } catch {
      setNoteSaveState('error')
    }
  }

  useEffect(() => {
    if (!running || !hasTimedWork) {
      return
    }

    const timer = window.setInterval(() => {
      setSeconds((prev) => prev + 1)
      setExerciseCountdown((prev) => {
        if (prev <= 1) {
          setRunning(false)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [running, hasTimedWork])

  if (!day || !current) {
    return <Navigate to={`${goalBasePath}/ready-workout`} replace />
  }

  const totalRounds = 3
  const atLastExercise = currentIndex >= day.exercises.length - 1
  const atRoundEnd = atLastExercise
  const atFinalRound = currentRound >= totalRounds
  const currentStepKey = `${currentRound}:${currentIndex}`
  const totalStepCount = day.exercises.length * totalRounds
  const completedCount = completedExerciseIndexes.size
  const completionRate = totalStepCount ? Math.round((completedCount / totalStepCount) * 100) : 0

  const buildSessionSummary = () => {
    const noteLine = collectCircuitNoteEntries()
      .slice(0, 6)
      .map((entry) => `${localizeExerciseName(entry.exerciseName, language)}: ${entry.note}`)
      .join(' | ')

    return `${day.exercises
      .slice(0, 6)
      .map((exercise) => `${localizeExerciseName(exercise.name, language)} - ${exercise.sets} x ${localizeRepsText(exercise.reps, language)}`)
      .join('; ')}${noteLine ? `; ${isRussian ? 'Заметки' : 'Notes'}: ${noteLine}` : ''}`
  }

  const finishWorkoutNow = async () => {
    setRunning(false)

    if (user) {
      try {
        await saveAllCircuitNotes()

        await recordWorkoutSession({
          userId: user.id,
          source: 'fat-loss',
          sourceKey: `${day.id}`,
          title: isRussian ? `Похудение день ${day.dayNumber}` : `Fat loss day ${day.dayNumber}`,
          durationSeconds: seconds,
          sessionType: 'circuit',
          sessionSummary: buildSessionSummary(),
        })
        const motivation = await incrementMotivationProgress(user.id)
        setMotivationWorkoutNumber(Math.max(0, motivation.workoutsCompleted))
      } catch {
        setMotivationWorkoutNumber(null)
      }
    }

    setIsFinished(true)
  }

  const handleNext = async () => {
    setRunning(false)

    if (atLastExercise && atFinalRound) {
      await finishWorkoutNow()
      return
    }

    if (atLastExercise) {
      setCurrentIndex(0)
      setCurrentRound((prev) => prev + 1)
      setExerciseCountdown(getExerciseWorkSecondsByIndex(0))
      return
    }

    setCurrentIndex((prev) => {
      const nextIndex = prev + 1
      setExerciseCountdown(getExerciseWorkSecondsByIndex(nextIndex))
      return nextIndex
    })
  }

  const handlePrev = () => {
    setRunning(false)
    setCurrentIndex((prev) => {
      const nextIndex = Math.max(prev - 1, 0)
      setExerciseCountdown(getExerciseWorkSecondsByIndex(nextIndex))
      return nextIndex
    })
  }

  const restartWorkout = () => {
    setCurrentIndex(0)
    setCurrentRound(1)
    setIsFinished(false)
    setRunning(false)
    setSeconds(0)
    setExerciseCountdown(getExerciseWorkSecondsByIndex(0))
    setCompletedExerciseIndexes(new Set())
  }

  const toggleComplete = () => {
    setCompletedExerciseIndexes((prev) => {
      const next = new Set(prev)
      if (next.has(currentStepKey)) {
        next.delete(currentStepKey)
      } else {
        next.add(currentStepKey)
      }
      return next
    })
  }

  if (isFinished) {
    const completionMinutes = Math.max(1, Math.round(seconds / 60))

    return (
      <div className="min-h-screen bg-[#f5f5f5] pb-24">
        <main className="mx-auto max-w-3xl px-6 py-8 md:py-10">
          <section className="fade-up rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] p-8 text-center shadow-sm transition-transform duration-300">
            <h1 className="mt-2 font-serif text-4xl text-[#111111] md:text-5xl">{isRussian ? 'Тренировка завершена' : 'Workout complete'}</h1>
            <p className="mt-2 text-lg font-semibold text-[#111111] md:text-xl">{isRussian ? 'Хорошая работа' : 'Nice work'}</p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-[#d4d4d8] bg-white p-4 text-left">
                <p className="text-2xl font-bold text-[#111111]">{completedCount}</p>
                <p className="mt-1 text-sm font-semibold text-[#111111]">{isRussian ? 'упражнения выполнено' : 'exercises completed'}</p>
                <p className="mt-1 text-xs text-[#52525b]">{isRussian ? 'Отличный фокус' : 'Great focus'}</p>
              </article>

              {seconds >= 60 ? (
                <article className="rounded-2xl border border-[#d4d4d8] bg-white p-4 text-left">
                  <p className="text-2xl font-bold text-[#111111]">{completionMinutes}</p>
                  <p className="mt-1 text-sm font-semibold text-[#111111]">{isRussian ? 'минут работы' : 'minutes of work'}</p>
                  <p className="mt-1 text-xs text-[#52525b]">{isRussian ? 'Хороший темп' : 'Good pace'}</p>
                </article>
              ) : null}
            </div>

            {motivationWorkoutNumber ? <PostWorkoutMotivationCard workoutNumber={motivationWorkoutNumber} language={isRussian ? 'ru' : 'en'} /> : null}

            <div className="mt-7 space-y-3">
              <button
                type="button"
                onClick={() => navigate(backToSheetPath)}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#111111] px-5 py-3.5 text-base font-semibold text-white md:text-lg"
              >
                {isRussian ? 'Продолжить' : 'Continue'}
              </button>
              <Link
                to="/dashboard"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[#111111] bg-white px-5 py-3.5 text-base font-semibold text-[#111111] md:text-lg"
              >
                {isRussian ? 'Завершить' : 'Back to Home'}
              </Link>
            </div>

            <button
              type="button"
              onClick={restartWorkout}
              className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#52525b] underline-offset-4 hover:underline"
            >
              {isRussian ? 'Начать заново' : 'Start again'}
            </button>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-24">
      <main className="mx-auto max-w-4xl px-6 py-8 md:py-10">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(backToSheetPath)}
            className="inline-flex items-center gap-2 text-base font-medium text-[#111111] transition hover:text-[#111111]"
          >
            <ArrowLeft size={18} />
            {isRussian ? 'Назад' : 'Come back'}
          </button>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-[#111111] shadow-sm"
          >
            <House size={16} />
            {isRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <article className="rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] p-8 shadow-sm">
          <h1 className="text-center font-serif text-3xl text-[#0f0f10] md:text-5xl">{current.icon} {currentDisplayName}</h1>
          <p className="mt-2 text-center text-lg text-[#111111] md:text-xl">{currentDisplayZone}</p>

          <ExerciseVideo videoUrl={current.videoUrl} title={currentDisplayName} />
          <TechniqueQuickCard exerciseName={currentDisplayName} techniqueText={currentTechnique} language={language} />

          {hasTimedWork ? (
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[#d4d4d8] bg-[#efefef] p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{isRussian ? 'Таймер упражнения' : 'Exercise Timer'}</p>
              <p className="mt-2 text-5xl font-black text-[#111111] md:text-6xl">{formatSeconds(exerciseCountdown)}</p>
              <p className="mt-2 text-sm text-[#52525b]">{isRussian ? `Работа: ${localizeRepsText(current.reps, language)} на упражнение` : `Work: ${localizeRepsText(current.reps, language)} per exercise`}</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setRunning((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-base font-semibold text-white md:text-lg"
                >
                  {running ? <Pause size={18} /> : <PlayCircle size={18} />}
                  {running ? (isRussian ? 'Пауза' : 'Pause') : (isRussian ? 'Старт' : 'Start')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRunning(false)
                    setExerciseCountdown(currentExerciseWorkSeconds)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-base font-semibold text-white md:text-lg"
                >
                  <RotateCcw size={18} />
                  {isRussian ? 'Сброс' : 'Reset'}
                </button>
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[#d4d4d8] bg-[#efefef] p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{isRussian ? 'Формат упражнения' : 'Exercise Format'}</p>
              <p className="mt-2 text-3xl font-black text-[#111111] md:text-4xl">{current.sets} x {localizeRepsText(current.reps, language)}</p>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#d4d4d8]">
            <div className="border-r border-[#d4d4d8] p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{isRussian ? 'Круг' : 'Round'}</p>
              <p className="mt-2 text-4xl font-bold text-[#0f0f10] md:text-5xl">{currentRound}/{totalRounds}</p>
            </div>
            <div className="p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{isRussian ? 'Круги' : 'Rounds'}</p>
              <p className="mt-2 text-4xl font-bold text-[#0f0f10] md:text-5xl">{totalRounds}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#d4d4d8] bg-white p-4">
            <p className="text-sm font-semibold text-[#0f0f10]">{t('workoutBuilder.workoutNotes')}</p>
            <p className="mt-1 text-xs text-gray-500">{isRussian ? 'Круговой формат: заметки сохраняются и отображаются в сводке календаря.' : 'Circuit format: notes are saved and shown in calendar summary.'}</p>
            <textarea
              value={noteText}
              onChange={(event) => {
                if (!noteKey) {
                  return
                }

                setNoteDrafts((prev) => ({
                  ...prev,
                  [noteKey]: event.target.value,
                }))
                setNoteSaveState('idle')
              }}
              rows={3}
              placeholder={t('workoutBuilder.notePlaceholder')}
              className="mt-3 w-full rounded-xl border border-[#d4d4d8] bg-[#f5f5f5] px-3 py-2 text-sm text-[#18181b] outline-none focus:border-[#111111]"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={saveCurrentNote}
                className="rounded-xl bg-[#111111] px-4 py-2 text-sm font-semibold text-white"
              >
                {noteSaveState === 'saving' ? t('workoutBuilder.saving') : noteSaveState === 'saved' ? t('workoutBuilder.saved') : t('workoutBuilder.saveNote')}
              </button>
            </div>

            {noteSaveState === 'saved' && (
              <p className="mt-2 text-right text-xs font-medium text-[#111111]">{t('workoutBuilder.noteSavedSuccess')}</p>
            )}
            {noteSaveState === 'error' && (
              <p className="mt-2 text-right text-xs font-medium text-[#7f1d1d]">{t('workoutBuilder.noteError')}</p>
            )}
          </div>

          <button
            type="button"
            onClick={toggleComplete}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl border px-6 py-4 text-lg font-semibold md:text-xl ${completedExerciseIndexes.has(currentStepKey) ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#d4d4d8] bg-white text-[#0f0f10]'}`}
          >
            {completedExerciseIndexes.has(currentStepKey) ? (isRussian ? 'Выполнено - нажми, чтобы отменить' : 'Completed - tap to undo') : (isRussian ? 'Отметить как выполненное' : 'Mark as Complete')}
          </button>

          {completedExerciseIndexes.has(currentStepKey) && (
            <p className="mt-2 text-center text-sm font-medium text-[#111111]">{isRussian ? 'Это упражнение отмечено как выполненное.' : 'This exercise is marked complete.'}</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-3 text-lg font-semibold text-white disabled:opacity-50 md:text-xl"
            >
              <ChevronLeft size={20} />
              {isRussian ? 'Назад' : 'Previous'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-3 text-lg font-semibold text-white md:text-xl"
            >
              {atLastExercise
                ? (atFinalRound ? (isRussian ? 'Завершить тренировку' : 'Finish Workout') : (isRussian ? `Начать круг ${currentRound + 1}` : `Start Round ${currentRound + 1}`))
                : (isRussian ? 'Следующее упражнение' : 'Next Exercise')}
              <ChevronRight size={20} />
            </button>
          </div>

          {atRoundEnd && (
            <button
              type="button"
              onClick={() => void finishWorkoutNow()}
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-[#111111] bg-white px-5 py-3 text-base font-semibold text-[#111111] md:text-lg"
            >
              {isRussian ? 'Завершить тренировку после этого круга' : 'Finish Workout After This Round'}
            </button>
          )}

          <section className="mt-6 rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] p-6 shadow-sm">
            <h2 className="text-center font-serif text-3xl text-[#0f0f10] md:text-4xl">{isRussian ? 'Прогресс тренировки' : 'Workout Progress'}</h2>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <article className="rounded-2xl border border-[#d4d4d8] p-5 text-center">
                <p className="text-4xl font-bold text-[#0f0f10] md:text-5xl">{completedCount}</p>
                <p className="mt-1 text-sm uppercase tracking-wider text-[#111111]">{isRussian ? 'Выполнено шагов' : 'Completed Steps'}</p>
              </article>
              <article className="rounded-2xl border border-[#d4d4d8] p-5 text-center">
                <p className="text-4xl font-bold text-[#0f0f10] md:text-5xl">{completionRate}%</p>
                <p className="mt-1 text-sm uppercase tracking-wider text-[#111111]">{isRussian ? 'Процент выполнения' : 'Completion Rate'}</p>
              </article>
            </div>
          </section>
        </article>
      </main>

    </div>
  )
}
