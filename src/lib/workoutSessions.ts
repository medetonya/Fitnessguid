import { supabase } from './supabase'

export type WorkoutSessionSource = 'builder' | 'fat-loss' | 'tone'

interface ShadowWorkoutSession {
  title: string
  completedAt: string
  sessionSummary: string | null
  sessionType: 'circuit' | 'sets' | null
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

export const recordWorkoutSession = async (input: {
  userId: string
  source: WorkoutSessionSource
  sourceKey: string
  title: string
  durationSeconds?: number
  completedAt?: string
  sessionType?: 'circuit' | 'sets'
  sessionSummary?: string
}) => {
  const completedAt = input.completedAt ?? new Date().toISOString()
  const startedAt = new Date(new Date(completedAt).getTime() - Math.max(input.durationSeconds ?? 0, 0) * 1000).toISOString()

  const basePayload = {
    user_id: input.userId,
    source: input.source,
    source_key: input.sourceKey,
    title: input.title,
    duration_seconds: Math.max(input.durationSeconds ?? 0, 0),
    started_at: startedAt,
    completed_at: completedAt,
    status: 'completed',
  }

  const { error: insertError } = await supabase.from('workout_sessions').insert({
    ...basePayload,
    session_type: input.sessionType ?? 'circuit',
    session_summary: input.sessionSummary ?? null,
  })

  if (insertError) {
    const message = `${insertError.message ?? ''} ${insertError.details ?? ''}`.toLowerCase()
    const missingSessionColumns = message.includes('session_type') || message.includes('session_summary')

    if (!missingSessionColumns) {
      throw insertError
    }

    const { error: fallbackInsertError } = await supabase.from('workout_sessions').insert(basePayload)
    if (fallbackInsertError) {
      throw fallbackInsertError
    }

    const existing = readShadowSessions(input.userId)
    existing.unshift({
      title: input.title,
      completedAt,
      sessionSummary: input.sessionSummary ?? null,
      sessionType: input.sessionType ?? 'circuit',
    })
    writeShadowSessions(input.userId, existing)
  }

  const { count, error: countError } = await supabase
    .from('workout_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', input.userId)
    .eq('status', 'completed')

  if (countError) {
    throw countError
  }

  return count ?? 0
}
