import { supabase } from './supabase'

export interface WorkoutNote {
  id: string
  userId: string
  key: string
  source: 'builder' | 'fat-loss' | 'tone'
  programLabel: string
  exerciseName: string
  noteText: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'workout-notes-v2'

const getLocalWorkoutNotes = (): WorkoutNote[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as Array<Partial<WorkoutNote>>
    if (!Array.isArray(parsed)) {
      return []
    }

    const normalized = parsed
      .filter((note) => typeof note.key === 'string' && typeof note.noteText === 'string')
      .map((note) => ({
        id: note.id ?? `legacy-${note.key ?? Date.now()}`,
        userId: note.userId ?? 'legacy',
        key: note.key as string,
        source: (note.source as WorkoutNote['source']) ?? 'builder',
        programLabel: note.programLabel ?? 'Workout',
        exerciseName: note.exerciseName ?? 'Exercise',
        noteText: note.noteText as string,
        createdAt: note.createdAt ?? new Date().toISOString(),
        updatedAt: note.updatedAt ?? new Date().toISOString(),
      }))

    return normalized
  } catch {
    return []
  }
}

const saveLocalWorkoutNotes = (notes: WorkoutNote[]) => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
}

const normalizeNoteRow = (row: {
  id: string
  user_id: string
  key: string
  source: WorkoutNote['source']
  program_label: string
  exercise_name: string
  note_text: string
  created_at: string
  updated_at: string
}): WorkoutNote => {
  return {
    id: row.id,
    userId: row.user_id,
    key: row.key,
    source: row.source,
    programLabel: row.program_label,
    exerciseName: row.exercise_name,
    noteText: row.note_text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export const getWorkoutNotes = async (userId?: string): Promise<WorkoutNote[]> => {
  if (!userId) {
    return []
  }

  const { data, error } = await supabase
    .from('workout_notes')
    .select('id, user_id, key, source, program_label, exercise_name, note_text, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    const fallback = getLocalWorkoutNotes().filter((note) => note.userId === userId)
    return fallback
  }

  return (data ?? []).map(normalizeNoteRow)
}

export const getWorkoutNoteByKey = async (key: string, userId?: string): Promise<WorkoutNote | null> => {
  if (!userId) {
    return null
  }

  const { data, error } = await supabase
    .from('workout_notes')
    .select('id, user_id, key, source, program_label, exercise_name, note_text, created_at, updated_at')
    .eq('user_id', userId)
    .eq('key', key)
    .maybeSingle()

  if (error) {
    const fallback = getLocalWorkoutNotes().find((note) => note.userId === userId && note.key === key)
    return fallback ?? null
  }

  if (!data) {
    return null
  }

  return normalizeNoteRow(data)
}

export const upsertWorkoutNote = async (input: {
  userId: string
  key: string
  source: WorkoutNote['source']
  programLabel: string
  exerciseName: string
  noteText: string
}) => {
  const trimmed = input.noteText.trim()

  if (!trimmed) {
    await supabase
      .from('workout_notes')
      .delete()
      .eq('user_id', input.userId)
      .eq('key', input.key)

    const local = getLocalWorkoutNotes().filter((note) => !(note.userId === input.userId && note.key === input.key))
    saveLocalWorkoutNotes(local)
    return
  }

  const { error } = await supabase
    .from('workout_notes')
    .upsert(
      {
        user_id: input.userId,
        key: input.key,
        source: input.source,
        program_label: input.programLabel,
        exercise_name: input.exerciseName,
        note_text: trimmed,
      },
      { onConflict: 'user_id,key' }
    )

  // Keep local fallback data in sync for offline resilience.
  const local = getLocalWorkoutNotes()
  const existingIndex = local.findIndex((note) => note.userId === input.userId && note.key === input.key)
  const now = new Date().toISOString()

  if (existingIndex >= 0) {
    local[existingIndex] = {
      ...local[existingIndex],
      userId: input.userId,
      source: input.source,
      programLabel: input.programLabel,
      exerciseName: input.exerciseName,
      noteText: trimmed,
      updatedAt: now,
    }
  } else {
    local.push({
      id: `local-${input.userId}-${input.key}`,
      userId: input.userId,
      key: input.key,
      source: input.source,
      programLabel: input.programLabel,
      exerciseName: input.exerciseName,
      noteText: trimmed,
      createdAt: now,
      updatedAt: now,
    })
  }

  saveLocalWorkoutNotes(local)

  if (error) {
    throw error
  }
}

export const deleteWorkoutNote = async (input: { userId: string; key: string }) => {
  const { error } = await supabase
    .from('workout_notes')
    .delete()
    .eq('user_id', input.userId)
    .eq('key', input.key)

  const local = getLocalWorkoutNotes().filter((note) => !(note.userId === input.userId && note.key === input.key))
  saveLocalWorkoutNotes(local)

  if (error) {
    throw error
  }
}

export const deleteWorkoutNotesByPrefix = async (input: {
  userId: string
  source: WorkoutNote['source']
  keyPrefix: string
}) => {
  const { error } = await supabase
    .from('workout_notes')
    .delete()
    .eq('user_id', input.userId)
    .eq('source', input.source)
    .like('key', `${input.keyPrefix}%`)

  const local = getLocalWorkoutNotes().filter(
    (note) => !(note.userId === input.userId && note.source === input.source && note.key.startsWith(input.keyPrefix))
  )
  saveLocalWorkoutNotes(local)

  if (error) {
    throw error
  }
}

export const migrateLegacyWorkoutNotes = async (userId: string) => {
  const local = getLocalWorkoutNotes().filter((note) => note.userId === userId)
  if (local.length === 0) {
    return
  }

  const payload = local.map((note) => ({
    user_id: userId,
    key: note.key,
    source: note.source,
    program_label: note.programLabel,
    exercise_name: note.exerciseName,
    note_text: note.noteText,
  }))

  await supabase.from('workout_notes').upsert(payload, { onConflict: 'user_id,key' })
}