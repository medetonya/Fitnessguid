import { ArrowLeft, Check, ChevronLeft, ChevronRight, House, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'
import { getMotivationMessage } from '../lib/motivationProgress'
import { supabase } from '../lib/supabase'
import { deleteWorkoutNotesByPrefix } from '../lib/workoutNotes'

interface ProgressItem {
  id: string
  programId: string
  programName: string
  programDuration: number
  currentDay: number
  status: 'active' | 'completed' | 'paused'
  startedAt: string
}

interface WorkoutDaySession {
  id: string
  title: string
  source: 'builder' | 'fat-loss' | 'tone' | null
  sourceKey: string | null
  sessionSummary: string | null
  sessionType: 'circuit' | 'sets' | null
  completedAt: string
}

interface ShadowWorkoutSession {
  title: string
  completedAt: string
  sessionSummary: string | null
  sessionType: 'circuit' | 'sets' | null
}

const weekDaysRu = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']
const weekDaysEn = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

const toDateKey = (value: Date) => {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toMonthKey = (value: Date) => {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  return `${year}-${month}`
}

interface MonthResult {
  monthKey: string
  monthLabel: string
  sessionsCount: number
  trainingDaysCount: number
  circuitCount: number
  setsCount: number
}

const readShadowSessions = (userId: string): ShadowWorkoutSession[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = localStorage.getItem(`workout-sessions-shadow-v1:${userId}`)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as ShadowWorkoutSession[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeShadowSessions = (userId: string, sessions: ShadowWorkoutSession[]) => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(`workout-sessions-shadow-v1:${userId}`, JSON.stringify(sessions.slice(0, 200)))
}

export default function ProgressTrackingPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const isRussian = language === 'ru'
  const locale = isRussian ? 'ru-RU' : 'en-US'
  const weekDays = isRussian ? weekDaysRu : weekDaysEn
  const [items, setItems] = useState<ProgressItem[]>([])
  const [loading, setLoading] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)
  const [sessionDateKeys, setSessionDateKeys] = useState<string[]>([])
  const [sessionEvents, setSessionEvents] = useState<WorkoutDaySession[]>([])
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null)
  const [deleteSessionBusyId, setDeleteSessionBusyId] = useState<string | null>(null)
  const [deleteSessionToast, setDeleteSessionToast] = useState(false)
  const [deleteSessionErrorToast, setDeleteSessionErrorToast] = useState(false)
  const [swipeOffsets, setSwipeOffsets] = useState<Record<string, number>>({})
  const [swipeDeleteReady, setSwipeDeleteReady] = useState<Record<string, boolean>>({})
  const [swipingSessionId, setSwipingSessionId] = useState<string | null>(null)
  const [motivationWorkoutsCompleted, setMotivationWorkoutsCompleted] = useState(0)
  const swipeStartX = useRef<Record<string, number | null>>({})
  const swipeStartY = useRef<Record<string, number | null>>({})
  const swipePointerId = useRef<Record<string, number | null>>({})
  const swipeAxis = useRef<Record<string, 'undecided' | 'horizontal' | 'vertical'>>({})

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('user_progress')
          .select('id, program_id, current_day, status, started_at, training_programs(name, duration)')
          .eq('user_id', user.id)
          .order('started_at', { ascending: false })

        if (error) {
          throw error
        }

        const normalized = (data ?? []).map((row) => {
          const related = Array.isArray(row.training_programs) ? row.training_programs[0] : row.training_programs
          return {
            id: row.id,
            programId: row.program_id,
            programName: related?.name ?? 'Program',
            programDuration: related?.duration ?? 0,
            currentDay: row.current_day ?? 1,
            status: row.status,
            startedAt: row.started_at,
          } as ProgressItem
        })

        setItems(normalized)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [user])

  useEffect(() => {
    if (!user?.id) {
      setSessionDateKeys([])
      setSessionEvents([])
      return
    }

    let cancelled = false

    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, source, source_key, title, session_summary, session_type, completed_at, started_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(500)

      let rows = data ?? []

      if (error) {
        const message = `${error.message ?? ''} ${error.details ?? ''}`.toLowerCase()
        const missingSessionColumns = message.includes('session_type') || message.includes('session_summary')

        if (!missingSessionColumns || cancelled) {
          return
        }

        const { data: fallbackData, error: fallbackError } = await supabase
          .from('workout_sessions')
          .select('id, source, source_key, title, completed_at, started_at')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(500)

        if (fallbackError || cancelled) {
          return
        }

        rows = (fallbackData ?? []).map((item) => ({
          ...item,
          session_summary: null,
          session_type: null,
        }))
      }

      const dbSessions = rows
        .map((item) => {
          const completedAt = item.completed_at ?? item.started_at
          if (!completedAt) {
            return null
          }

          return {
            id: item.id,
            title: item.title ?? 'Workout',
            source: item.source ?? null,
            sourceKey: item.source_key ?? null,
            sessionSummary: item.session_summary ?? null,
            sessionType: item.session_type ?? null,
            completedAt,
          } as WorkoutDaySession
        })
        .filter((item): item is WorkoutDaySession => Boolean(item))

      const shadowSessions = readShadowSessions(user.id)
      const mergedByKey = new Map<string, WorkoutDaySession>()

      dbSessions.forEach((session) => {
        const mapKey = `${session.title}|${session.completedAt}`
        mergedByKey.set(mapKey, session)
      })

      shadowSessions.forEach((session, index) => {
        const mapKey = `${session.title}|${session.completedAt}`
        const existing = mergedByKey.get(mapKey)

        if (existing) {
          mergedByKey.set(mapKey, {
            ...existing,
            sessionSummary: existing.sessionSummary ?? session.sessionSummary ?? null,
            sessionType: existing.sessionType ?? session.sessionType ?? null,
          })
          return
        }

        mergedByKey.set(mapKey, {
          id: `shadow-${index}-${session.completedAt}`,
          title: session.title,
          source: null,
          sourceKey: null,
          sessionSummary: session.sessionSummary ?? null,
          sessionType: session.sessionType ?? null,
          completedAt: session.completedAt,
        })
      })

      const mergedSessions = Array.from(mergedByKey.values())
      const keys = mergedSessions.map((item) => toDateKey(new Date(item.completedAt)))

      setSessionDateKeys(keys)
      setSessionEvents(mergedSessions)
    }

    fetchSessions()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) {
      setMotivationWorkoutsCompleted(0)
      return
    }

    let cancelled = false

    const fetchMotivationProgress = async () => {
      const { data, error } = await supabase
        .from('user_motivation_progress')
        .select('workouts_completed, current_day')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cancelled) {
        return
      }

      if (error) {
        setMotivationWorkoutsCompleted(0)
        return
      }

      const workoutsCompleted = Number(data?.workouts_completed ?? 0)
      const currentDay = Number(data?.current_day ?? 0)
      setMotivationWorkoutsCompleted(Math.max(0, workoutsCompleted, currentDay))
    }

    void fetchMotivationProgress()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const activeItem = useMemo(() => {
    return items.find((item) => item.status === 'active') ?? items[0] ?? null
  }, [items])

  const now = new Date()
  const viewedMonthDate = useMemo(() => new Date(now.getFullYear(), now.getMonth() + monthOffset, 1), [monthOffset, now])
  const year = viewedMonthDate.getFullYear()
  const month = viewedMonthDate.getMonth()
  const monthTitle = viewedMonthDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const viewedMonthKey = toMonthKey(viewedMonthDate)

  const calendarCells = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const firstOffset = (firstDay.getDay() + 6) % 7
    const totalDays = new Date(year, month + 1, 0).getDate()
    return [
      ...Array.from({ length: firstOffset }, () => null),
      ...Array.from({ length: totalDays }, (_, index) => index + 1),
    ]
  }, [month, year])

  const completedDateKeys = useMemo(() => {
    const keys = new Set<string>()

    if (!activeItem) {
      return keys
    }

    const completedDays = Math.max(activeItem.currentDay - 1, 0)
    const start = new Date(activeItem.startedAt)

    for (let index = 0; index < completedDays; index += 1) {
      const date = new Date(start)
      date.setDate(start.getDate() + index)
      keys.add(toDateKey(date))
    }

    return keys
  }, [activeItem])

  const calendarDoneKeys = useMemo(() => {
    const keys = new Set(completedDateKeys)
    sessionDateKeys.forEach((key) => keys.add(key))
    return keys
  }, [completedDateKeys, sessionDateKeys])

  const selectedDaySessions = useMemo(() => {
    if (!selectedDayKey) {
      return []
    }

    return sessionEvents.filter((session) => toDateKey(new Date(session.completedAt)) === selectedDayKey)
  }, [selectedDayKey, sessionEvents])

  const monthResults = useMemo(() => {
    const buckets = new Map<string, { label: string; days: Set<string>; sessions: number; circuit: number; sets: number }>()

    sessionEvents.forEach((session) => {
      const date = new Date(session.completedAt)
      if (Number.isNaN(date.getTime())) {
        return
      }

      const key = toMonthKey(date)
      const existing = buckets.get(key) ?? {
        label: date.toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
        days: new Set<string>(),
        sessions: 0,
        circuit: 0,
        sets: 0,
      }

      existing.sessions += 1
      existing.days.add(toDateKey(date))
      if (session.sessionType === 'sets') {
        existing.sets += 1
      } else {
        existing.circuit += 1
      }

      buckets.set(key, existing)
    })

    return Array.from(buckets.entries())
      .map(([monthKey, value]) => ({
        monthKey,
        monthLabel: value.label,
        sessionsCount: value.sessions,
        trainingDaysCount: value.days.size,
        circuitCount: value.circuit,
        setsCount: value.sets,
      }) satisfies MonthResult)
      .sort((left, right) => right.monthKey.localeCompare(left.monthKey))
  }, [locale, sessionEvents])

  const hasLaterMonth = monthOffset < 0
  const hasEarlierMonth = useMemo(() => {
    if (monthResults.length === 0) {
      return false
    }

    const earliestMonth = monthResults[monthResults.length - 1]?.monthKey
    if (!earliestMonth) {
      return false
    }

    return viewedMonthKey > earliestMonth
  }, [monthResults, viewedMonthKey])

  const totalCompletedWorkouts = useMemo(() => {
    return Math.max(0, motivationWorkoutsCompleted, sessionEvents.length)
  }, [motivationWorkoutsCompleted, sessionEvents.length])

  const motivationDayNumber = useMemo(() => {
    if (totalCompletedWorkouts <= 0) {
      return 0
    }

    return Math.min(36, totalCompletedWorkouts)
  }, [totalCompletedWorkouts])

  const motivationMessage = useMemo(() => {
    if (motivationDayNumber <= 0) {
      return null
    }

    return getMotivationMessage(motivationDayNumber, isRussian ? 'ru' : 'en')
  }, [isRussian, motivationDayNumber])

  const canSwipeDelete = (_session: WorkoutDaySession) => true

  const formatSummaryText = (summary: string | null) => {
    if (!summary) {
      return isRussian ? 'Подробная сводка не записана.' : 'Detailed summary is not recorded.'
    }

    return summary
      .replace(/\s*\|\s*/g, '\n')
      .replace(/;\s*/g, ';\n')
  }

  const handleDeleteSessionCard = async (session: WorkoutDaySession) => {
    if (!user?.id) {
      return
    }

    setDeleteSessionBusyId(session.id)

    try {
      if (session.sourceKey && (session.source === 'builder' || session.source === 'fat-loss' || session.source === 'tone')) {
        const keyPrefix = `${session.source}:${session.sourceKey}:`
        await deleteWorkoutNotesByPrefix({
          userId: user.id,
          source: session.source,
          keyPrefix,
        })
      }

      if (!session.id.startsWith('shadow-')) {
        const { error: deleteError } = await supabase
          .from('workout_sessions')
          .delete()
          .eq('id', session.id)
          .eq('user_id', user.id)

        if (deleteError) {
          throw deleteError
        }
      }

      const shadow = readShadowSessions(user.id)
      const nextShadow = shadow.filter((item) => !(item.title === session.title && item.completedAt === session.completedAt))
      writeShadowSessions(user.id, nextShadow)

      setSessionEvents((prev) => {
        const next = prev.filter((item) => item.id !== session.id)
        setSessionDateKeys(next.map((item) => toDateKey(new Date(item.completedAt))))
        return next
      })

      setSwipeOffsets((prev) => {
        const next = { ...prev }
        delete next[session.id]
        return next
      })
      setSwipeDeleteReady((prev) => {
        const next = { ...prev }
        delete next[session.id]
        return next
      })
      delete swipeStartX.current[session.id]

      setDeleteSessionToast(true)
      window.setTimeout(() => setDeleteSessionToast(false), 1600)
    } catch {
      setDeleteSessionErrorToast(true)
      window.setTimeout(() => setDeleteSessionErrorToast(false), 1800)
    } finally {
      setDeleteSessionBusyId(null)
    }
  }

  const handleSwipeStart = (sessionId: string, clientX: number, clientY?: number) => {
    swipeStartX.current[sessionId] = clientX
    swipeStartY.current[sessionId] = typeof clientY === 'number' ? clientY : null
    swipeAxis.current[sessionId] = 'undecided'
    setSwipingSessionId(sessionId)
  }

  const handleSwipePointerStart = (
    sessionId: string,
    clientX: number,
    clientY: number,
    pointerId: number
  ) => {
    swipeStartX.current[sessionId] = clientX
    swipeStartY.current[sessionId] = clientY
    swipePointerId.current[sessionId] = pointerId
    swipeAxis.current[sessionId] = 'undecided'
    setSwipingSessionId(sessionId)
  }

  const handleSwipeMove = (sessionId: string, clientX: number) => {
    const start = swipeStartX.current[sessionId]
    if (start === null || typeof start !== 'number') {
      return
    }

    const delta = clientX - start
    const clamped = Math.max(-108, Math.min(0, delta))
    setSwipeOffsets((prev) => ({
      ...prev,
      [sessionId]: clamped,
    }))
  }

  const handleSwipeEnd = (sessionId: string) => {
    const offset = swipeOffsets[sessionId] ?? 0
    if (offset <= -62) {
      setSwipeOffsets((prev) => ({
        ...prev,
        [sessionId]: -108,
      }))
      setSwipeDeleteReady((prev) => ({
        ...prev,
        [sessionId]: true,
      }))
    } else {
      setSwipeOffsets((prev) => ({
        ...prev,
        [sessionId]: 0,
      }))
      setSwipeDeleteReady((prev) => ({
        ...prev,
        [sessionId]: false,
      }))
    }

    swipeStartX.current[sessionId] = null
    swipeStartY.current[sessionId] = null
    swipePointerId.current[sessionId] = null
    delete swipeAxis.current[sessionId]
    setSwipingSessionId((prev) => (prev === sessionId ? null : prev))
  }

  const handleSwipePointerMove = (
    sessionId: string,
    clientX: number,
    clientY: number
  ) => {
    const startX = swipeStartX.current[sessionId]
    const startY = swipeStartY.current[sessionId]
    if (startX === null || typeof startX !== 'number' || startY === null || typeof startY !== 'number') {
      return false
    }

    const deltaX = clientX - startX
    const deltaY = clientY - startY
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    const axis = swipeAxis.current[sessionId] ?? 'undecided'

    if (axis === 'undecided') {
      if (absX < 6 && absY < 6) {
        return false
      }

      swipeAxis.current[sessionId] = absX > absY ? 'horizontal' : 'vertical'
    }

    if (swipeAxis.current[sessionId] !== 'horizontal') {
      return false
    }

    handleSwipeMove(sessionId, clientX)
    return true
  }

  useEffect(() => {
    setSelectedDayKey(null)
  }, [monthOffset])

  const closeSwipeDelete = (sessionId: string) => {
    setSwipeOffsets((prev) => ({
      ...prev,
      [sessionId]: 0,
    }))
    setSwipeDeleteReady((prev) => ({
      ...prev,
      [sessionId]: false,
    }))
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <main className="app-shell">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 text-base font-medium text-gray-500 transition hover:text-gray-900"
          >
            <ArrowLeft size={18} />
            {isRussian ? 'Назад' : 'Back'}
          </button>

          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm text-gray-500 shadow-sm"
          >
            <House size={16} />
            {isRussian ? 'Меню' : 'Menu'}
          </Link>
        </div>

        <section className="app-plain-section fade-up mb-5">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <TrendingUp size={24} />
          </div>
          <h1 className="font-serif text-5xl leading-tight text-[#1f2328] md:text-6xl">{isRussian ? 'Прогресс' : 'Progress'}</h1>
          <p className="mt-3 text-xl text-gray-600 md:text-2xl">{isRussian ? 'Как отслеживать результаты правильно' : 'How to track results the right way'}</p>
        </section>

        <section className="app-card fade-up mb-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-3xl text-[#1f2328]">{isRussian ? 'Календарь тренировок' : 'Workout Calendar'}</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => prev - 1)}
                disabled={!hasEarlierMonth}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d4d4d8] bg-white text-[#111111] disabled:opacity-40"
                aria-label={isRussian ? 'Предыдущий месяц' : 'Previous month'}
              >
                <ChevronLeft size={16} />
              </button>
              <p className="min-w-[150px] text-center text-sm font-semibold uppercase tracking-wider text-[#52525b]">{monthTitle}</p>
              <button
                type="button"
                onClick={() => setMonthOffset((prev) => Math.min(prev + 1, 0))}
                disabled={!hasLaterMonth}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d4d4d8] bg-white text-[#111111] disabled:opacity-40"
                aria-label={isRussian ? 'Следующий месяц' : 'Next month'}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-3xl animate-pulse">🍑</p>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center text-xs font-semibold uppercase tracking-wider text-gray-500">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarCells.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="h-10 rounded-lg bg-transparent" />
                  }

                  const cellDate = new Date(year, month, day)
                  const dateKey = toDateKey(cellDate)
                  const done = calendarDoneKeys.has(dateKey)
                  const isToday = dateKey === toDateKey(now)

                  return (
                    <div
                      key={dateKey}
                      role={done ? 'button' : undefined}
                      tabIndex={done ? 0 : -1}
                      onClick={() => {
                        if (done) {
                          setSelectedDayKey(dateKey)
                        }
                      }}
                      onKeyDown={(event) => {
                        if (done && (event.key === 'Enter' || event.key === ' ')) {
                          event.preventDefault()
                          setSelectedDayKey(dateKey)
                        }
                      }}
                      className={`flex h-10 items-center justify-center rounded-lg border text-sm font-medium ${done ? 'cursor-pointer border-[#111111] bg-[#111111] text-white' : isToday ? 'border-[#52525b] bg-[#e8e8e8] text-[#18181b]' : 'border-[#d4d4d8] bg-[#f1f1f1] text-gray-600'}`}
                    >
                      {done ? <Check size={14} /> : day}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </section>

        <section className="app-hero fade-up mb-4">
          {totalCompletedWorkouts === 0 ? (
            <div className="rounded-3xl border border-[#f2dbe7] bg-gradient-to-br from-[#fff9fc] via-[#fff4f9] to-[#fdf8ff] p-4 sm:p-5">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f3d0e1] bg-white text-[#9d174d]">
                <Sparkles size={16} />
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9d174d]">{isRussian ? 'Мотивация' : 'Motivation'}</p>
              <h3 className="mt-2 font-serif text-[1.45rem] leading-tight text-[#5b1234]">{isRussian ? 'Тренировка 0' : 'Workout 0'}</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-[#6b2145]">
                {isRussian
                  ? 'Сигнал ещё не запущен.'
                  : 'System not activated yet.'}
              </p>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-[#6b2145]">
                {isRussian
                  ? 'Сделай первую тренировку и запусти День 1.'
                  : 'Complete your first workout to unlock Day 1.'}
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-[#f2dbe7] bg-gradient-to-br from-[#fff9fc] via-[#fff4f9] to-[#fdf8ff] p-4 sm:p-5">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#f3d0e1] bg-white text-[#9d174d]">
                <Sparkles size={16} />
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9d174d]">{isRussian ? 'Мотивация' : 'Motivation'}</p>
              <h3 className="mt-2 font-serif text-[1.45rem] leading-tight text-[#5b1234]">{isRussian ? `Тренировка ${totalCompletedWorkouts}` : `Workout ${totalCompletedWorkouts}`}</h3>
              {motivationMessage ? (
                <>
                  <p className="mt-3 text-[0.98rem] leading-relaxed font-semibold text-[#6b2145]">{motivationMessage.title}</p>
                  <p className="mt-2 text-[0.98rem] leading-relaxed text-[#6b2145]">{motivationMessage.description}</p>
                  <p className="mt-2 text-[0.98rem] leading-relaxed text-[#6b2145]">{motivationMessage.emotion}</p>
                </>
              ) : null}
            </div>
          )}
        </section>

        <section className="space-y-4 pb-8">
          <article className="app-card fade-up">
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Главный принцип' : 'Core Principle'}</h2>
            <p className="mt-4 text-xl leading-relaxed text-gray-600 md:text-2xl">
              {isRussian ? 'Измерения важнее, чем просто цифра на весах.' : 'Measurements matter more than just the number on the scale.'}
            </p>
            <p className="mt-4 text-xl leading-relaxed text-gray-600 md:text-2xl">
              {isRussian
                ? 'Весы не показывают полную картину. Можно одновременно сжигать жир и набирать мышечную массу, и это не всегда видно по весу.'
                : 'Scales do not show the full picture. You can lose fat and gain muscle at the same time, and this is not always visible in body weight.'}
            </p>
          </article>

          <article className="app-card fade-up">
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Как измерять правильно' : 'How to Measure Correctly'}</h2>
            <ul className="mt-4 space-y-2 text-xl leading-relaxed text-gray-600 md:text-2xl">
              <li>{isRussian ? 'Используй мягкую сантиметровую ленту' : 'Use a soft measuring tape'}</li>
              <li>{isRussian ? 'Измеряй утром в одинаковых условиях' : 'Measure in the morning under the same conditions'}</li>
              <li>{isRussian ? 'Делай 3 замера и считай среднее' : 'Take 3 measurements and use the average'}</li>
              <li>{isRussian ? 'Измеряй в самой широкой или узкой точке зоны' : 'Measure at the widest or narrowest point of each area'}</li>
            </ul>
          </article>

          <article className="app-card fade-up">
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Что измерять' : 'What to Measure'}</h2>
            <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-gray-500 md:text-base">{isRussian ? 'Параметры тела' : 'Body Measurements'}</p>
            <hr className="my-4 border-gray-200" />
            <ul className="space-y-2 text-xl leading-relaxed text-gray-600 md:text-2xl">
              <li>{isRussian ? 'Талия (самая узкая точка)' : 'Waist (narrowest point)'}</li>
              <li>{isRussian ? 'Низ живота (самая широкая точка)' : 'Lower abdomen (widest point)'}</li>
              <li>{isRussian ? 'Бедра (самая широкая точка)' : 'Hips (widest point)'}</li>
              <li>{isRussian ? 'Грудь (по линии сосков)' : 'Chest (nipple line)'}</li>
              <li>{isRussian ? 'Рука (бицепс в напряжении)' : 'Arm (biceps flexed)'}</li>
              <li>{isRussian ? 'Бедро (середина бедра)' : 'Thigh (mid-thigh)'}</li>
            </ul>
          </article>

          <article className="app-card fade-up">
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Фото прогресса' : 'Progress Photos'}</h2>
            <p className="mt-4 text-xl leading-relaxed text-gray-600 md:text-2xl">{isRussian ? 'Фото — самый честный индикатор прогресса.' : 'Photos are the most honest progress indicator.'}</p>
            <ul className="mt-3 space-y-2 text-xl leading-relaxed text-gray-600 md:text-2xl">
              <li>{isRussian ? 'Одно и то же место и освещение' : 'Same place and lighting'}</li>
              <li>{isRussian ? 'Одинаковая одежда или минимум одежды' : 'Same clothing or minimal clothing'}</li>
              <li>{isRussian ? 'Ракурсы: спереди / сбоку / сзади' : 'Angles: front / side / back'}</li>
              <li>{isRussian ? 'Нейтральная расслабленная поза' : 'Neutral relaxed posture'}</li>
              <li>{isRussian ? 'Каждые 1-2 недели' : 'Every 1-2 weeks'}</li>
            </ul>
          </article>

          <article className="app-card fade-up">
            <h2 className="font-serif text-4xl text-[#2c2f33] md:text-5xl">{isRussian ? 'Дополнительные индикаторы' : 'Additional Indicators'}</h2>
            <p className="mt-4 text-xl leading-relaxed text-gray-600 md:text-2xl">{isRussian ? 'Важны и победы не по весам:' : 'Non-scale victories matter too:'}</p>
            <ul className="mt-3 space-y-2 text-xl leading-relaxed text-gray-600 md:text-2xl">
              <li>{isRussian ? 'Лучшая техника упражнений' : 'Better exercise technique'}</li>
              <li>{isRussian ? 'Выше выносливость и работоспособность' : 'Higher endurance and work capacity'}</li>
              <li>{isRussian ? 'Меньше отеков и вздутия' : 'Less water retention and bloating'}</li>
              <li>{isRussian ? 'Тело ощущается более подтянутым' : 'Body feels more toned'}</li>
              <li>{isRussian ? 'Одежда сидит лучше' : 'Clothes fit better'}</li>
              <li>{isRussian ? 'Больше энергии в течение дня' : 'More energy during the day'}</li>
            </ul>
          </article>
        </section>
      </main>

      {selectedDayKey && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center" onClick={() => setSelectedDayKey(null)}>
          <div
            className={`w-full ${selectedDaySessions.some((item) => (item.sessionSummary ?? '').length > 180) ? 'max-w-2xl' : 'max-w-md'} max-h-[82vh] overflow-y-auto rounded-3xl border border-[#d4d4d8] bg-white p-5 shadow-2xl`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-2xl text-[#111111]">{isRussian ? 'Сводка тренировки' : 'Workout Summary'}</h3>
              <button
                type="button"
                onClick={() => setSelectedDayKey(null)}
                className="rounded-full border border-[#d4d4d8] px-3 py-1 text-xs font-semibold text-[#111111]"
              >
                {isRussian ? 'Закрыть' : 'Close'}
              </button>
            </div>

            <p className="text-xs uppercase tracking-wider text-[#52525b]">{selectedDayKey}</p>

            {selectedDaySessions.length === 0 ? (
              <p className="mt-3 text-sm text-[#52525b]">{isRussian ? 'Тренировка за этот день отмечена, но подробная запись пока недоступна.' : 'Workout was marked for this day, but detailed entry is not available yet.'}</p>
            ) : (
              <div className="mt-3 space-y-2">
                {selectedDaySessions.map((session) => (
                  <div key={session.id} className="overflow-hidden rounded-xl border border-[#d4d4d8] bg-[#f5f5f5]">
                    {canSwipeDelete(session) ? (
                      <div className="relative min-h-[112px]">
                        <div className="absolute inset-y-0 right-0 flex w-28 items-center justify-center bg-[#111111] text-sm font-semibold text-white">
                          <button
                            type="button"
                            onClick={() => void handleDeleteSessionCard(session)}
                            disabled={!swipeDeleteReady[session.id] || deleteSessionBusyId === session.id}
                            className={`rounded px-2 py-1 font-semibold text-[#f472b6] transition ${(swipeDeleteReady[session.id] && deleteSessionBusyId !== session.id) ? 'opacity-100' : 'opacity-45'}`}
                          >
                            {deleteSessionBusyId === session.id ? (isRussian ? 'Удаление...' : 'Deleting...') : (isRussian ? 'Удалить' : 'Delete')}
                          </button>
                        </div>

                        <article
                          className="absolute inset-0 bg-[#f5f5f5] p-3"
                          style={{
                            transform: `translateX(${swipeOffsets[session.id] ?? 0}px)`,
                            transition: swipingSessionId === session.id ? 'none' : 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
                            touchAction: 'pan-y',
                          }}
                          onPointerDown={(event) => {
                            if (event.pointerType === 'mouse' && event.button !== 0) {
                              return
                            }

                            handleSwipePointerStart(session.id, event.clientX, event.clientY, event.pointerId)
                            event.currentTarget.setPointerCapture(event.pointerId)
                          }}
                          onPointerMove={(event) => {
                            if (swipePointerId.current[session.id] !== event.pointerId) {
                              return
                            }

                            const didSwipe = handleSwipePointerMove(session.id, event.clientX, event.clientY)
                            if (didSwipe) {
                              event.preventDefault()
                            }
                          }}
                          onPointerUp={(event) => {
                            if (swipePointerId.current[session.id] !== event.pointerId) {
                              return
                            }

                            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                              event.currentTarget.releasePointerCapture(event.pointerId)
                            }
                            handleSwipeEnd(session.id)
                          }}
                          onPointerCancel={(event) => {
                            if (swipePointerId.current[session.id] !== event.pointerId) {
                              return
                            }

                            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                              event.currentTarget.releasePointerCapture(event.pointerId)
                            }
                            handleSwipeEnd(session.id)
                          }}
                          onTouchStart={(event) => handleSwipeStart(session.id, event.touches[0].clientX, event.touches[0].clientY)}
                          onTouchMove={(event) => {
                            const didSwipe = handleSwipePointerMove(session.id, event.touches[0].clientX, event.touches[0].clientY)
                            if (didSwipe) {
                              event.preventDefault()
                            }
                          }}
                          onTouchEnd={() => handleSwipeEnd(session.id)}
                          onTouchCancel={() => handleSwipeEnd(session.id)}
                          onClick={() => {
                            if (swipeDeleteReady[session.id]) {
                              closeSwipeDelete(session.id)
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-[#111111]">{session.title}</p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void handleDeleteSessionCard(session)}
                                disabled={deleteSessionBusyId === session.id}
                                className="rounded-md border border-[#be185d] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#be185d] disabled:opacity-50"
                              >
                                {deleteSessionBusyId === session.id ? (isRussian ? 'Удаление...' : 'Deleting...') : (isRussian ? 'Удалить' : 'Delete')}
                              </button>
                            </div>
                          </div>
                          <p className="mt-1 text-xs text-[#52525b]">{session.sessionType === 'sets' ? (isRussian ? 'Силовой формат' : 'Strength format') : (isRussian ? 'Круговой формат' : 'Circuit format')}</p>
                          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#27272a]">{formatSummaryText(session.sessionSummary)}</p>
                        </article>
                      </div>
                    ) : (
                      <article className="p-3">
                        <p className="text-sm font-semibold text-[#111111]">{session.title}</p>
                        <div className="mt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void handleDeleteSessionCard(session)}
                            disabled={deleteSessionBusyId === session.id}
                            className="rounded-md border border-[#be185d] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#be185d] disabled:opacity-50"
                          >
                            {deleteSessionBusyId === session.id ? (isRussian ? 'Удаление...' : 'Deleting...') : (isRussian ? 'Удалить' : 'Delete')}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-[#52525b]">{session.sessionType === 'sets' ? (isRussian ? 'Силовой формат' : 'Strength format') : (isRussian ? 'Круговой формат' : 'Circuit format')}</p>
                        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#27272a]">{formatSummaryText(session.sessionSummary)}</p>
                      </article>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {deleteSessionToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#111111] bg-[#111111] px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {isRussian ? 'Тренировка удалена' : 'Workout deleted'}
        </div>
      )}

      {deleteSessionErrorToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#7f1d1d] bg-[#7f1d1d] px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {isRussian ? 'Не удалось удалить заметку' : 'Failed to delete note'}
        </div>
      )}
    </div>
  )
}
