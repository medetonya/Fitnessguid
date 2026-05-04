import { ArrowLeft, ChevronLeft, ChevronRight, House, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import ExerciseVideo from '../components/ExerciseVideo'
import PostWorkoutMotivationCard from '../components/PostWorkoutMotivationCard'
import TechniqueQuickCard from '../components/TechniqueQuickCard'
import type { BuilderExercise, BuilderExerciseTag } from '../components/ExerciseBuilderScreen'
import { getExerciseInfo } from '../data/exerciseInfoLibrary'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { readBuilderWorkoutStorage } from '../lib/builderWorkoutStorage'
import { incrementMotivationProgress } from '../lib/motivationProgress'
import { recordWorkoutSession } from '../lib/workoutSessions'
import { getWorkoutNoteByKey, upsertWorkoutNote } from '../lib/workoutNotes'
import { localizeExerciseName, localizeExerciseZone, localizeTechniqueText } from '../lib/exerciseTextLocalization'

interface StoredWorkout {
  selectedExercises: BuilderExercise[]
  executionMode: 'reps' | 'timer'
  sourcePath: string
  createdAt: string
}

interface RepsSetRow {
  weightKg: string
  reps: string
}

const tagClasses: Record<BuilderExerciseTag, string> = {
  'Main exercise': 'bg-[#e8e8e8] text-[#111111] border-[#d4d4d8]',
  Accessory: 'bg-[#efefef] text-[#111111] border-[#d4d4d8]',
  Isolation: 'bg-[#f2f2f2] text-[#111111] border-[#d4d4d8]',
  Cardio: 'bg-[#ececec] text-[#111111] border-[#d4d4d8]',
  'Core exercise': 'bg-[#eeeeee] text-[#111111] border-[#d4d4d8]',
}

const repsHintsStorageKey = 'builder-reps-hints-v2'

const formatSeconds = (value: number) => {
  const minutes = Math.floor(value / 60)
  const seconds = value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const defaultSetRows = (): RepsSetRow[] =>
  Array.from({ length: 4 }, () => ({ weightKg: '', reps: '' }))

const toExerciseHintKey = (trainingPreset: 'fat-loss' | 'tone', exerciseName: string, userId?: string) => {
  const safeExercise = exerciseName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return `${trainingPreset}:${userId ?? 'guest'}:${safeExercise}`
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

export default function BuilderTrainingModePage() {
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const isRussian = language === 'ru'
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const key = searchParams.get('key')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentRound, setCurrentRound] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [running, setRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [restCountdown, setRestCountdown] = useState(90)
  const [betweenRoundsCountdown, setBetweenRoundsCountdown] = useState<number | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [motivationWorkoutNumber, setMotivationWorkoutNumber] = useState<number | null>(null)
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({})
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>({})
  const [noteSaveState, setNoteSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [repsRowsByExercise, setRepsRowsByExercise] = useState<Record<string, RepsSetRow[]>>({})
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

  const trainingPreset = key?.includes('fat-loss') ? 'fat-loss' : 'tone'
  const tagLabels: Record<BuilderExerciseTag, string> = {
    'Main exercise': t('workoutBuilder.tagMain'),
    Accessory: t('workoutBuilder.tagAccessory'),
    Isolation: t('workoutBuilder.tagIsolation'),
    Cardio: t('workoutBuilder.tagCardio'),
    'Core exercise': t('workoutBuilder.tagCore'),
  }

  const stored = useMemo<StoredWorkout | null>(() => {
    if (!key) return null
    const raw = readBuilderWorkoutStorage(key, user?.id)
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw) as Partial<StoredWorkout>
      if (!Array.isArray(parsed.selectedExercises) || parsed.selectedExercises.length === 0) {
        return null
      }

      return {
        selectedExercises: parsed.selectedExercises,
        executionMode: trainingPreset === 'tone' ? 'reps' : parsed.executionMode === 'timer' ? 'timer' : 'reps',
        sourcePath: parsed.sourcePath ?? '/dashboard',
        createdAt: parsed.createdAt ?? new Date().toISOString(),
      }
    } catch {
      return null
    }
  }, [key, trainingPreset, user?.id])

  const backToSourcePath = stored?.sourcePath || '/dashboard'

  const isRepsMode = stored?.executionMode === 'reps'
  const isFatLossPreset = trainingPreset === 'fat-loss'
  const isTonePreset = trainingPreset === 'tone'
  const isFatLossRepetitionCircuit = isRepsMode && isFatLossPreset
  const totalRounds = isFatLossRepetitionCircuit ? 5 : isRepsMode ? 1 : isFatLossPreset ? 5 : 4
  const restSeconds = isFatLossRepetitionCircuit ? 120 : isRepsMode ? (isTonePreset ? 120 : 90) : isFatLossPreset ? 30 : 45

  const exercises = useMemo(
    () =>
      (stored?.selectedExercises ?? []).map((exercise, index) => ({
        ...exercise,
        id: exercise.id ?? `${exercise.name}-${index}`,
        sets: exercise.sets ?? '3-4',
        reps: exercise.reps ?? (isFatLossPreset ? '15-18' : '8-12'),
      })),
    [isFatLossPreset, stored]
  )

  const current = exercises[currentIndex] ?? null
  const currentStepKey = current ? `${currentRound}:${current.id}` : ''
  const noteKey = current ? `builder:${key ?? 'session'}:${current.id}` : null
  const noteText = noteKey ? (noteDrafts[noteKey] ?? savedNotes[noteKey] ?? '') : ''
  const repsHintKey = current ? toExerciseHintKey(trainingPreset, current.name, user?.id) : null
  const currentDisplayName = current ? localizeExerciseName(current.name, language) : ''
  const currentDisplayZone = current ? localizeExerciseZone(current.zone ?? t('workoutBuilder.selectedWorkoutExercise'), language) : ''
  const currentTechnique = useMemo(() => {
    if (!current) {
      return undefined
    }

    const fallback = getExerciseInfo(current.name, current.zone, current.tag).technique
    const rawTechnique = current.technique ?? fallback

    return localizeTechniqueText(rawTechnique, current.tag, current.name, language)
  }, [current, language])
  const currentSetRows = repsHintKey ? (repsRowsByExercise[repsHintKey] ?? defaultSetRows()) : defaultSetRows()
  const currentSetHints = repsHintKey ? (lastRepsHintsByExercise[repsHintKey] ?? defaultSetRows()) : defaultSetRows()
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
    if (isRepsMode || !noteKey || !user?.id) {
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
  }, [isRepsMode, noteKey, user?.id])

  useEffect(() => {
    if (!stored || !running) {
      return
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)

      if (stored.executionMode === 'reps') {
        setRestCountdown((prev) => {
          if (prev <= 1) {
            setRunning(false)
            return 0
          }

          return prev - 1
        })
        return
      }

      setTimerSeconds((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [running, stored])

  useEffect(() => {
    if (betweenRoundsCountdown === null) {
      return
    }

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1)
      setBetweenRoundsCountdown((prev) => {
        if (prev === null) {
          return null
        }

        if (prev <= 1) {
          setCurrentRound((round) => round + 1)
          setCurrentIndex(0)
          return null
        }

        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [betweenRoundsCountdown])

  if (!stored || !current) {
    return <Navigate to="/dashboard" replace />
  }

  const totalStepCount = exercises.length * totalRounds
  const completedCount = completedSteps.size
  const completionRate = totalStepCount ? Math.round((completedCount / totalStepCount) * 100) : 0
  const allCompleted = totalStepCount > 0 && completedCount === totalStepCount
  const isBetweenRoundsRest = betweenRoundsCountdown !== null
  const atLastExercise = currentIndex === exercises.length - 1
  const atRoundEnd = atLastExercise
  const atFinalRound = currentRound >= totalRounds
  const displayedSeconds = isBetweenRoundsRest ? (betweenRoundsCountdown ?? 0) : stored.executionMode === 'reps' ? restCountdown : timerSeconds

  const resetExerciseTimer = () => {
    setRunning(false)
    if (stored.executionMode === 'reps') {
      setRestCountdown(restSeconds)
      return
    }

    setTimerSeconds(0)
  }

  const handlePrev = () => {
    if (isBetweenRoundsRest) {
      return
    }

    resetExerciseTimer()
    setCurrentIndex((prev) => Math.max(prev - 1, 0))
  }

  const collectTimerNoteEntries = () => {
    return exercises
      .map((exercise) => {
        const entryKey = `builder:${key ?? 'session'}:${exercise.id}`
        const note = (noteDrafts[entryKey] ?? savedNotes[entryKey] ?? '').trim()
        if (!note) {
          return null
        }

        return {
          key: entryKey,
          exerciseName: exercise.name,
          note,
        }
      })
      .filter((item): item is { key: string; exerciseName: string; note: string } => Boolean(item))
  }

  const saveAllTimerNotes = async () => {
    if (isRepsMode || !user) {
      return
    }

    const entries = collectTimerNoteEntries()
    if (entries.length === 0) {
      return
    }

    await Promise.allSettled(
      entries.map((entry) =>
        upsertWorkoutNote({
          userId: user.id,
          key: entry.key,
          source: 'builder',
          programLabel: t('workoutBuilder.builderWorkoutTitle'),
          exerciseName: entry.exerciseName,
          noteText: entry.note,
        })
      )
    )
  }

  const buildBuilderSessionSummary = () => {
    if (isRepsMode) {
      return exercises
        .map((exercise) => {
          const hintKey = toExerciseHintKey(trainingPreset, exercise.name, user?.id)
          const summary = formatSetSummary(repsRowsByExercise[hintKey] ?? [], language)
          return summary ? `${localizeExerciseName(exercise.name, language)} - ${summary}` : null
        })
        .filter((line): line is string => Boolean(line))
        .slice(0, 6)
        .join('; ')
    }

    const base = `${t('workoutBuilder.circuitWorkoutSummary')} ${completedCount}/${totalStepCount}`
    const noteLine = collectTimerNoteEntries()
      .slice(0, 6)
      .map((entry) => `${localizeExerciseName(entry.exerciseName, language)}: ${entry.note}`)
      .join(' | ')

    return noteLine ? `${base}; ${t('workoutBuilder.notesPrefix')} ${noteLine}` : base
  }

  const persistBuilderSession = async () => {
    if (!user) {
      return
    }

    try {
      await saveAllTimerNotes()
      await recordWorkoutSession({
        userId: user.id,
        source: 'builder',
        sourceKey: key ?? 'builder-session',
        title: t('workoutBuilder.builderWorkoutTitle'),
        durationSeconds: elapsedSeconds,
        sessionType: isRepsMode ? 'sets' : 'circuit',
        sessionSummary: buildBuilderSessionSummary(),
      })
      const motivation = await incrementMotivationProgress(user.id)
      setMotivationWorkoutNumber(Math.max(0, motivation.workoutsCompleted))
    } catch {
      setMotivationWorkoutNumber(null)
    }
  }

  const saveCurrentNote = async () => {
    if (isRepsMode || !noteKey || !user) {
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
        source: 'builder',
        programLabel: t('workoutBuilder.builderWorkoutTitle'),
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
    if (isBetweenRoundsRest) {
      return
    }

    if (atRoundEnd) {
      if (atFinalRound) {
        setRunning(false)
        setIsFinished(true)
        void persistBuilderSession()
        return
      }

      if (isFatLossPreset) {
        setRunning(false)
        setBetweenRoundsCountdown(120)
        return
      }

      resetExerciseTimer()
      setCurrentRound((prev) => prev + 1)
      setCurrentIndex(0)
      return
    }

    resetExerciseTimer()
    setCurrentIndex((prev) => prev + 1)
  }

  const finishAfterRound = async () => {
    setRunning(false)
    setIsFinished(true)
    void persistBuilderSession()
  }

  const toggleComplete = () => {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      if (next.has(currentStepKey)) {
        next.delete(currentStepKey)
      } else {
        next.add(currentStepKey)
      }
      return next
    })
  }

  const resetWorkout = () => {
    setCurrentIndex(0)
    setCurrentRound(1)
    setCompletedSteps(new Set())
    setRunning(false)
    setBetweenRoundsCountdown(null)
    setTimerSeconds(0)
    setRestCountdown(restSeconds)
    setElapsedSeconds(0)
    setIsFinished(false)
  }

  const skipBetweenRoundRest = () => {
    if (betweenRoundsCountdown === null) {
      return
    }

    setBetweenRoundsCountdown(null)
    setCurrentRound((round) => round + 1)
    setCurrentIndex(0)
  }

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
                onClick={() => navigate(backToSourcePath)}
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
              onClick={resetWorkout}
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
            onClick={() => navigate(backToSourcePath)}
            className="inline-flex items-center gap-2 text-base font-medium text-[#111111] transition hover:text-[#111111]"
          >
            <ArrowLeft size={18} />
            {t('workoutBuilder.comeBack')}
          </button>

          <Link to="/dashboard" className="hidden items-center gap-2 rounded-xl bg-[#efefef] px-4 py-2 text-sm text-[#111111] shadow-sm">
            <House size={16} />
            {t('workoutBuilder.home')}
          </Link>
        </div>

        <section className="mb-6 rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] p-8 shadow-sm">
          <h1 className="text-center font-serif text-3xl text-[#0f0f10] md:text-5xl">{current.icon ? `${current.icon} ` : ''}{currentDisplayName}</h1>
          <p className="mt-2 text-center text-lg text-[#111111] md:text-xl">{currentDisplayZone || t('workoutBuilder.selectedWorkoutExercise')}</p>
          <div className="mt-3 flex items-center justify-center">
            <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${tagClasses[current.tag as BuilderExerciseTag]}`}>
              {tagLabels[current.tag as BuilderExerciseTag]}
            </span>
          </div>

          <ExerciseVideo videoUrl={current.videoUrl} title={currentDisplayName} />
          <TechniqueQuickCard exerciseName={currentDisplayName} techniqueText={currentTechnique} language={language} />

          <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-[#d4d4d8] bg-[#efefef] p-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
              {isBetweenRoundsRest
                ? t('workoutBuilder.restBetweenRounds')
                : stored.executionMode === 'timer'
                  ? t('workoutBuilder.workoutTimer')
                  : t('workoutBuilder.restCountdown')}
            </p>
            <p className="mt-2 text-5xl font-black text-[#111111] md:text-6xl">{formatSeconds(displayedSeconds)}</p>
            {stored.executionMode === 'reps' && (
              <p className="mt-2 text-sm text-[#52525b]">
                {isFatLossRepetitionCircuit
                  ? t('workoutBuilder.restHintFatLossReps')
                  : isTonePreset
                    ? t('workoutBuilder.restHintToneReps')
                    : `${t('workoutBuilder.restHintBetweenExercisesPrefix')} (${restSeconds}s).`}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRunning((prev) => !prev)}
                disabled={isBetweenRoundsRest}
                className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-base font-semibold text-white md:text-lg"
              >
                {running ? <Pause size={18} /> : <Play size={18} />}
                {running ? t('workoutBuilder.pause') : t('workoutBuilder.start')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRunning(false)
                  setBetweenRoundsCountdown(null)
                  if (stored.executionMode === 'reps') {
                    setRestCountdown(restSeconds)
                    return
                  }

                  setTimerSeconds(0)
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-5 py-3 text-base font-semibold text-white md:text-lg"
              >
                <RotateCcw size={18} />
                {t('workoutBuilder.reset')}
              </button>
            </div>
          </div>

          {isBetweenRoundsRest && (
            <div className="mt-4 rounded-2xl border border-[#d4d4d8] bg-white p-4">
              <p className="text-sm font-semibold text-[#111111]">{t('workoutBuilder.restBeforeRound')} {Math.min(currentRound + 1, totalRounds)}.</p>
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={skipBetweenRoundRest}
                  className="rounded-xl border border-[#111111] bg-white px-4 py-2 text-sm font-semibold text-[#111111]"
                >
                  {t('workoutBuilder.skipRest')}
                </button>
              </div>
            </div>
          )}

          <div className={`mt-6 grid overflow-hidden rounded-2xl border border-[#d4d4d8] ${isTonePreset && isRepsMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {!(isTonePreset && isRepsMode) && (
              <div className="border-r border-[#d4d4d8] p-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{t('workoutBuilder.round')}</p>
                <p className="mt-2 text-4xl font-bold text-[#0f0f10] md:text-5xl">{currentRound}/{totalRounds}</p>
              </div>
            )}
            <div className="p-6">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">
                {isFatLossPreset ? t('workoutBuilder.round') : stored.executionMode === 'reps' ? t('workoutBuilder.approachFormat') : t('workoutBuilder.rounds')}
              </p>
              <p className="mt-2 text-3xl font-bold text-[#0f0f10] md:text-4xl">
                {stored.executionMode === 'reps'
                  ? isFatLossRepetitionCircuit
                    ? '3-5'
                    : isTonePreset
                      ? t('workoutBuilder.approachRange')
                      : t('workoutBuilder.approachRangeWithReps')
                  : isFatLossPreset
                    ? '3-5'
                    : '4-5'}
              </p>
              {isFatLossPreset && (
                <p className="mt-1 text-sm font-medium text-[#52525b]">
                  {stored.executionMode === 'reps' ? t('workoutBuilder.reps15to18') : t('workoutBuilder.eachExercise30to50')}
                </p>
              )}
              {isTonePreset && stored.executionMode === 'reps' && (
                <p className="mt-1 text-sm font-medium text-[#52525b]">{t('workoutBuilder.reps8to12')}</p>
              )}
            </div>
          </div>

          {!isRepsMode && (
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
                <p className="mt-2 text-right text-xs font-medium text-[#7f1d1d]">{t('workoutBuilder.addTextBeforeSaving')}</p>
              )}
            </div>
          )}

          {isRepsMode && !isFatLossPreset && (
            <div className="mt-6 rounded-2xl border border-[#d4d4d8] bg-white p-4">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#111111]">{t('workoutBuilder.setLog')}</p>
              <p className="mt-1 text-xs text-gray-500">{t('workoutBuilder.setLogHint')}</p>

              <div className="mt-4 overflow-hidden rounded-xl border border-[#d4d4d8]">
                <div className="grid grid-cols-[72px_1fr_1fr] bg-[#f5f5f5] px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#111111]">
                  <span>{t('workoutBuilder.set')}</span>
                  <span>{t('workoutBuilder.kg')}</span>
                  <span>{t('workoutBuilder.reps')}</span>
                </div>

                <div className="divide-y divide-[#e4e4e7]">
                  {currentSetRows.map((row, index) => (
                    <div key={`set-row-${index}`} className="grid grid-cols-[72px_1fr_1fr] items-center gap-2 px-3 py-2">
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
                1RM = {current1RM !== null ? `${current1RM} ${language === 'ru' ? 'кг' : 'kg'}` : '...'}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={toggleComplete}
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border border-[#d4d4d8] bg-white px-6 py-4 text-lg font-semibold text-[#0f0f10] md:text-xl"
          >
            {completedSteps.has(currentStepKey) ? t('workoutBuilder.completedTapUndo') : t('workoutBuilder.markAsComplete')}
          </button>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0 || isBetweenRoundsRest}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-3 text-lg font-semibold text-white disabled:opacity-50 md:text-xl"
            >
              <ChevronLeft size={20} />
              {t('workoutBuilder.previous')}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={isBetweenRoundsRest}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#111111] px-5 py-3 text-lg font-semibold text-white disabled:opacity-50 md:text-xl"
            >
              {atRoundEnd
                ? atFinalRound
                  ? t('workoutBuilder.finishWorkout')
                  : isFatLossPreset
                    ? t('workoutBuilder.startRest')
                    : `${t('workoutBuilder.startRound')} ${currentRound + 1}`
                : t('workoutBuilder.next')}
              <ChevronRight size={20} />
            </button>
          </div>

          {!isRepsMode && atRoundEnd && !isBetweenRoundsRest && (
            <button
              type="button"
              onClick={finishAfterRound}
              className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-[#111111] bg-white px-5 py-3 text-base font-semibold text-[#111111] md:text-lg"
            >
              {t('workoutBuilder.finishAfterRound')}
            </button>
          )}
        </section>

        <section className="rounded-[22px] border border-[#d4d4d8] bg-[#f1f1f1] p-8 shadow-sm">
          <h2 className="text-center font-serif text-3xl text-[#0f0f10] md:text-4xl">{t('workoutBuilder.workoutProgress')}</h2>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <article className="rounded-2xl border border-[#d4d4d8] p-5 text-center">
              <p className="text-4xl font-bold text-[#0f0f10] md:text-5xl">{completedCount}</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-[#111111]">{t('workoutBuilder.completedSteps')}</p>
            </article>
            <article className="rounded-2xl border border-[#d4d4d8] p-5 text-center">
              <p className="text-4xl font-bold text-[#0f0f10] md:text-5xl">{completionRate}%</p>
              <p className="mt-1 text-sm uppercase tracking-wider text-[#111111]">{t('workoutBuilder.completionRate')}</p>
            </article>
          </div>

          {allCompleted && (
            <div className="mt-6 rounded-2xl border border-[#d4d4d8] bg-[#ececec] p-5 text-center">
              <h3 className="text-2xl font-semibold text-[#111111] md:text-3xl">{t('workoutBuilder.workoutComplete')}</h3>
              <p className="mt-2 text-base text-[#111111] md:text-lg">{t('workoutBuilder.greatJobFinished')}</p>
            </div>
          )}
        </section>
      </main>

    </div>
  )
}
