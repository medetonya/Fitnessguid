import { ArrowLeft, ChevronLeft, ChevronRight, Pause, PlayCircle, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import ExerciseVideo from '../components/ExerciseVideo'
import PostWorkoutMotivationCard from '../components/PostWorkoutMotivationCard'
import TechniqueQuickCard from '../components/TechniqueQuickCard'
import { getExerciseInfo } from '../data/exerciseInfoLibrary'
import { getToneReadyWorkoutDay } from '../data/toneReadyWorkouts'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { localizeExerciseName, localizeExerciseZone, localizeRepsText, localizeTechniqueText } from '../lib/exerciseTextLocalization'
import { incrementMotivationProgress } from '../lib/motivationProgress'
import { recordWorkoutSession } from '../lib/workoutSessions'
import { getWorkoutNoteByKey, upsertWorkoutNote } from '../lib/workoutNotes'

interface RepsSetRow {
  weightKg: string
  reps: string
}

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

const defaultSetRows = (): RepsSetRow[] =>
  Array.from({ length: 4 }, () => ({ weightKg: '', reps: '' }))
const repsHintsStorageKey = 'tone-reps-hints-v1'

const toExerciseHintKey = (exerciseName: string, userId?: string) => {
  const safeExercise = exerciseName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `tone:${userId ?? 'guest'}:${safeExercise}`
}

const calcEpley1RM = (weightKg: number, reps: number) => {
  return weightKg * (1 + reps / 30)
}

const formatSetSummary = (rows: RepsSetRow[], language: string) => {
  const valid = rows
    .map((row) => ({
      weightKg: Number(row.weightKg),
      reps: Number(row.reps),
    }))
    .filter((row) => Number.isFinite(row.weightKg) && row.weightKg > 0 && Number.isFinite(row.reps) && row.reps > 0)

  if (valid.length === 0) {
    return null
  }

  const best = valid.reduce((prev, current) => {
    const prevScore = calcEpley1RM(prev.weightKg, prev.reps)
    const currentScore = calcEpley1RM(current.weightKg, current.reps)
    return currentScore > prevScore ? current : prev
  })

  const kgUnit = language === 'ru' ? 'кг' : 'kg'
  return `${best.weightKg} ${kgUnit} x ${best.reps}`
}

export default function ToneTrainingModePage() {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const { dayId } = useParams()
  const { pathname } = useLocation()
  const isGymRoute = pathname.includes('/workouts/gym/')
  const goalBasePath = isGymRoute ? '/workouts/gym/goal/muscle-tone' : '/workouts/home/goal/muscle-tone'
  const day = getToneReadyWorkoutDay(dayId, isGymRoute ? 'gym' : 'home')
  const backToSheetPath = dayId ? `${goalBasePath}/ready-workout/sheet/${dayId}` : `${goalBasePath}/ready-workout`
  const isHomeFullBodyWorkout = !isGymRoute && Boolean(day?.title && /full\s*body/i.test(day.title))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [running, setRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [exerciseCountdown, setExerciseCountdown] = useState(() => {
    const firstReps = day?.exercises[0]?.reps
    return firstReps ? parseExerciseWorkSeconds(firstReps) : 40
  })
  const [restRunning, setRestRunning] = useState(false)
  const [restCountdown, setRestCountdown] = useState(90)
  const [motivationWorkoutNumber, setMotivationWorkoutNumber] = useState<number | null>(null)
  const [completedExerciseIndexes, setCompletedExerciseIndexes] = useState<Set<number>>(new Set())
  const [repsRowsByExercise, setRepsRowsByExercise] = useState<Record<string, RepsSetRow[]>>({})
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({})
  const [noteSaveState, setNoteSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastRepsHintsByExercise, setLastRepsHintsByExercise] = useState<Record<string, RepsSetRow[]>>(() => {
    if (typeof window === 'undefined') {
      return {}
    }

    const raw = localStorage.getItem(repsHintsStorageKey)
    if (!raw) {
      return {}
    }

    try {
      return JSON.parse(raw) as Record<string, RepsSetRow[]>
    } catch {
      return {}
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    localStorage.setItem(repsHintsStorageKey, JSON.stringify(lastRepsHintsByExercise))
  }, [lastRepsHintsByExercise])

  const current = useMemo(() => {
    if (!day) return null
    return day.exercises[currentIndex]
  }, [day, currentIndex])

  const repsHintKey = current ? toExerciseHintKey(current.name, user?.id) : null
  const noteKey = day && current && isHomeFullBodyWorkout ? `tone:${day.id}:${currentIndex}:${current.name}` : null
  const noteText = noteKey ? (noteDrafts[noteKey] ?? savedNotes[noteKey] ?? '') : ''
  const currentDisplayName = current ? localizeExerciseName(current.name, language) : ''
  const currentDisplayZone = current ? localizeExerciseZone(current.zone, language) : ''
  const currentTechnique = useMemo(() => {
    if (!current) {
      return undefined
    }

    const info = getExerciseInfo(current.name, current.zone, current.tag)
    return localizeTechniqueText(info.technique, current.tag, current.name, language)
  }, [current, language])
  const currentSetRows = repsHintKey ? (repsRowsByExercise[repsHintKey] ?? defaultSetRows()) : defaultSetRows()
  const currentSetHints = repsHintKey ? (lastRepsHintsByExercise[repsHintKey] ?? defaultSetRows()) : defaultSetRows()
  const hasTimedWork = Boolean(current?.reps && /\b(sec|сек)\b/i.test(current.reps))
  const currentExerciseWorkSeconds = current ? parseExerciseWorkSeconds(current.reps) : 40

  const getExerciseWorkSecondsByIndex = (index: number) => {
    if (!day) {
      return 40
    }

    return parseExerciseWorkSeconds(day.exercises[index]?.reps ?? '40 sec')
  }

  const current1RM = useMemo(() => {
    const values = currentSetRows
      .map((row) => ({
        weightKg: Number(row.weightKg),
        reps: Number(row.reps),
      }))
      .filter((row) => Number.isFinite(row.weightKg) && row.weightKg > 0 && Number.isFinite(row.reps) && row.reps > 0)

    if (values.length === 0) {
      return null
    }

    const best = values.reduce((prev, currentValue) => {
      const prevScore = calcEpley1RM(prev.weightKg, prev.reps)
      const currentScore = calcEpley1RM(currentValue.weightKg, currentValue.reps)
      return currentScore > prevScore ? currentValue : prev
    })

    return Math.round(calcEpley1RM(best.weightKg, best.reps) * 10) / 10
  }, [currentSetRows])

  useEffect(() => {
    if (!running || !hasTimedWork) {
      return
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
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

  useEffect(() => {
    if (!restRunning) {
      return
    }

    const timer = window.setInterval(() => {
      setRestCountdown((prev) => {
        if (prev <= 1) {
          setRestRunning(false)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [restRunning])

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

  if (!day || !current) {
    return <Navigate to={`${goalBasePath}/ready-workout`} replace />
  }

  const completedCount = completedExerciseIndexes.size
  const totalStepCount = day.exercises.length
  const completionRate = totalStepCount ? Math.round((completedCount / totalStepCount) * 100) : 0

  const setRepsRowValue = (rowIndex: number, field: 'weightKg' | 'reps', value: string) => {
    if (!repsHintKey) {
      return
    }

    setRepsRowsByExercise((prev) => {
      const currentRows = prev[repsHintKey] ?? defaultSetRows()
      const nextRows = currentRows.map((row, index) => {
        if (index !== rowIndex) {
          return row
        }

        return {
          ...row,
          [field]: value,
        }
      })

      const next = {
        ...prev,
        [repsHintKey]: nextRows,
      }

      setLastRepsHintsByExercise((previousHints) => ({
        ...previousHints,
        [repsHintKey]: nextRows,
      }))

      return next
    })
  }

  const resetExerciseTimer = () => {
    setRunning(false)
    setExerciseCountdown(currentExerciseWorkSeconds)
  }

  const resetRestTimer = () => {
    setRestRunning(false)
    setRestCountdown(90)
  }

  const persistToneWorkoutSession = async () => {
    if (!user) {
      return
    }

    try {
      const collectToneNoteEntries = () => {
        if (!day || !isHomeFullBodyWorkout) {
          return []
        }

        return day.exercises
          .map((exercise, index) => {
            const key = `tone:${day.id}:${index}:${exercise.name}`
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

      const noteEntries = collectToneNoteEntries()

      if (noteEntries.length > 0) {
        await Promise.allSettled(
          noteEntries.map((entry) =>
            upsertWorkoutNote({
              userId: user.id,
              key: entry.key,
              source: 'tone',
              programLabel: isRussian ? `Тонус день ${day.dayNumber}` : `Tone day ${day.dayNumber}`,
              exerciseName: entry.exerciseName,
              noteText: entry.note,
            })
          )
        )
      }

      const noteLine = noteEntries
        .slice(0, 6)
        .map((entry) => `${localizeExerciseName(entry.exerciseName, language)}: ${entry.note}`)
        .join(' | ')

      const summary = day.exercises
        .map((exercise) => {
          const hintKey = toExerciseHintKey(exercise.name, user.id)
          const hintSummary = formatSetSummary(repsRowsByExercise[hintKey] ?? [], language)
          const localizedName = localizeExerciseName(exercise.name, language)
          return hintSummary
            ? `${localizedName} - ${hintSummary}`
            : `${localizedName} - ${exercise.sets} x ${localizeRepsText(exercise.reps, language)}`
        })
        .slice(0, 6)
        .join('; ')

      const finalSummary = noteLine ? `${summary}; ${t('workoutBuilder.notesPrefix')} ${noteLine}` : summary

      await recordWorkoutSession({
        userId: user.id,
        source: 'tone',
        sourceKey: `${day.id}`,
        title: isRussian ? `Тонус день ${day.dayNumber}` : `Tone day ${day.dayNumber}`,
        durationSeconds: elapsedSeconds,
        sessionType: 'sets',
        sessionSummary: finalSummary,
      })
      const motivation = await incrementMotivationProgress(user.id)
      setMotivationWorkoutNumber(Math.max(0, motivation.workoutsCompleted))
    } catch {
      setMotivationWorkoutNumber(null)
    }
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
        source: 'tone',
        programLabel: isRussian ? `Тонус день ${day.dayNumber}` : `Tone day ${day.dayNumber}`,
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

  const handleNext = async () => {
    if (currentIndex >= day.exercises.length - 1) {
      setRunning(false)
      setIsFinished(true)
      void persistToneWorkoutSession()
      return
    }

    setRunning(false)
    resetRestTimer()
    setExerciseCountdown(getExerciseWorkSecondsByIndex(currentIndex + 1))
    setCurrentIndex((prev) => prev + 1)
  }

  const handlePrev = () => {
    setRunning(false)
    resetRestTimer()
    setCurrentIndex((prev) => {
      const nextIndex = Math.max(prev - 1, 0)
      setExerciseCountdown(getExerciseWorkSecondsByIndex(nextIndex))
      return nextIndex
    })
  }

  const restartWorkout = () => {
    setCurrentIndex(0)
    setIsFinished(false)
    setRunning(false)
    setRestRunning(false)
    setElapsedSeconds(0)
    setExerciseCountdown(getExerciseWorkSecondsByIndex(0))
    setRestCountdown(90)
    setCompletedExerciseIndexes(new Set())
  }

  const toggleComplete = () => {
    setCompletedExerciseIndexes((prev) => {
      const next = new Set(prev)
      if (next.has(currentIndex)) {
        next.delete(currentIndex)
      } else {
        next.add(currentIndex)
      }
      return next
    })
  }

  if (isFinished) {
    const completionMinutes = Math.max(1, Math.round(elapsedSeconds / 60))

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

              {elapsedSeconds >= 60 ? (
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
        </div>

        <article className="rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] p-8 shadow-sm">
          <h1 className="text-center font-serif text-3xl text-[#0f0f10] md:text-5xl">{current.icon} {currentDisplayName}</h1>
          <p className="mt-2 text-center text-lg text-[#111111] md:text-xl">{currentDisplayZone}</p>

          <ExerciseVideo videoUrl={current.videoUrl} title={currentDisplayName} />
          <TechniqueQuickCard exerciseName={currentDisplayName} techniqueText={currentTechnique} language={language} />

          {hasTimedWork && (
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
                  onClick={resetExerciseTimer}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-base font-semibold text-white md:text-lg"
                >
                  <RotateCcw size={18} />
                  {isRussian ? 'Сброс' : 'Reset'}
                </button>
              </div>
            </div>
          )}

          <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-[#d4d4d8] bg-[#efefef] p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{isRussian ? 'Таймер отдыха' : 'Rest Timer'}</p>
            <p className="mt-2 text-5xl font-black text-[#111111] md:text-6xl">{formatSeconds(restCountdown)}</p>
            <p className="mt-2 text-sm text-[#52525b]">{isRussian ? 'Стандартный отдых между упражнениями: 1:30' : 'Standard rest between exercises: 1:30'}</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRestRunning((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-base font-semibold text-white md:text-lg"
              >
                {restRunning ? <Pause size={18} /> : <PlayCircle size={18} />}
                {restRunning ? (isRussian ? 'Пауза' : 'Pause') : (isRussian ? 'Старт' : 'Start')}
              </button>
              <button
                type="button"
                onClick={resetRestTimer}
                className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-base font-semibold text-white md:text-lg"
              >
                <RotateCcw size={18} />
                {isRussian ? 'Сброс' : 'Reset'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-[#d4d4d8]">
            <div className="border-r border-[#d4d4d8] p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{isRussian ? 'Упражнение' : 'Exercise'}</p>
              <p className="mt-1 text-2xl font-bold text-[#111111]">{currentIndex + 1}/{day.exercises.length}</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{isRussian ? 'Формат' : 'Format'}</p>
              <p className="mt-1 text-2xl font-bold text-[#111111]">{current.sets} x {localizeRepsText(current.reps, language)}</p>
            </div>
          </div>

          {!hasTimedWork && (
            <div className="mt-6 rounded-2xl border border-[#d4d4d8] bg-white p-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{isRussian ? 'Журнал подходов' : 'Set Log'}</p>
              <p className="mt-1 text-xs text-gray-500">{isRussian ? 'Один круг. Заполни каждый подход; значения сохраняются для этого упражнения.' : 'One round. Fill each set; values are remembered for this exercise.'}</p>

              <div className="mt-4 overflow-hidden rounded-xl border border-[#d4d4d8]">
                <div className="grid grid-cols-[64px_1fr_1fr] bg-[#f5f5f5] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#111111]">
                  <span>{isRussian ? 'Подход' : 'Set'}</span>
                  <span>{isRussian ? 'кг' : 'kg'}</span>
                  <span>{isRussian ? 'Повт.' : 'Reps'}</span>
                </div>

                <div className="divide-y divide-[#e4e4e7]">
                  {currentSetRows.map((row, index) => (
                    <div key={`set-row-${index}`} className="grid grid-cols-[64px_1fr_1fr] items-center gap-2 px-3 py-2">
                      <span className="text-sm font-semibold text-[#111111]">{index + 1}</span>
                      <input
                        value={row.weightKg}
                        onChange={(event) => setRepsRowValue(index, 'weightKg', event.target.value.replace(/[^0-9.]/g, ''))}
                        inputMode="decimal"
                        maxLength={5}
                        placeholder={currentSetHints[index]?.weightKg || '0'}
                        className="w-16 rounded-lg border border-[#d4d4d8] bg-white px-2 py-1 text-center text-sm text-[#111111] placeholder:text-[#a1a1aa] outline-none focus:border-[#111111]"
                      />
                      <input
                        value={row.reps}
                        onChange={(event) => setRepsRowValue(index, 'reps', event.target.value.replace(/[^0-9]/g, ''))}
                        inputMode="numeric"
                        maxLength={3}
                        placeholder={currentSetHints[index]?.reps || '0'}
                        className="w-14 rounded-lg border border-[#d4d4d8] bg-white px-2 py-1 text-center text-sm text-[#111111] placeholder:text-[#a1a1aa] outline-none focus:border-[#111111]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-3 text-sm font-semibold text-[#111111]">
                1RM = {current1RM !== null ? `${current1RM} ${isRussian ? 'кг' : 'kg'}` : '...'}
              </p>
            </div>
          )}

          {isHomeFullBodyWorkout && (
            <div className="mt-6 rounded-2xl border border-[#d4d4d8] bg-white p-4">
              <p className="text-sm font-semibold text-[#0f0f10]">{t('workoutBuilder.workoutNotes')}</p>
              <p className="mt-1 text-xs text-gray-500">{t('workoutBuilder.timerNotesHint')}</p>
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
          )}

          <button
            type="button"
            onClick={toggleComplete}
            className={`mt-6 inline-flex w-full items-center justify-center rounded-2xl border px-6 py-4 text-lg font-semibold md:text-xl ${completedExerciseIndexes.has(currentIndex) ? 'border-[#111111] bg-[#111111] text-white' : 'border-[#d4d4d8] bg-white text-[#0f0f10]'}`}
          >
            {completedExerciseIndexes.has(currentIndex)
              ? isRussian
                ? 'Выполнено - нажми, чтобы отменить'
                : 'Completed - tap to undo'
              : isRussian
                ? 'Отметить как выполненное'
                : 'Mark as Complete'}
          </button>

          {completedExerciseIndexes.has(currentIndex) && (
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
              {currentIndex === day.exercises.length - 1
                ? isRussian
                  ? 'Завершить тренировку'
                  : 'Finish Workout'
                : isRussian
                  ? 'Следующее упражнение'
                  : 'Next Exercise'}
              <ChevronRight size={20} />
            </button>
          </div>

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
