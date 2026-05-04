import type { BuilderExercise } from '../components/ExerciseBuilderScreen'
import { supabase } from './supabase'

export interface SavedCustomWorkout {
  id: string
  name: string
  modePreset: 'fat-loss' | 'tone'
  executionMode: 'reps' | 'timer'
  selectedExercises: BuilderExercise[]
  sourcePath: string
  trainingPath: string
  storageKey: string
  createdAt: string
}

const customWorkoutsStorageKey = 'my-workouts:v2'

const getCustomWorkoutsStorageKey = (userId?: string) => {
  return userId ? `${customWorkoutsStorageKey}:${userId}` : `${customWorkoutsStorageKey}:guest`
}

const isSavedWorkout = (value: unknown): value is SavedCustomWorkout => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const item = value as Partial<SavedCustomWorkout>
  return Boolean(
    item.id
    && item.name
    && item.modePreset
    && item.executionMode
    && item.sourcePath
    && item.trainingPath
    && item.storageKey
    && item.createdAt
    && Array.isArray(item.selectedExercises)
  )
}

export const getSavedCustomWorkouts = (userId?: string): SavedCustomWorkout[] => {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = localStorage.getItem(getCustomWorkoutsStorageKey(userId))
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown[]
    return parsed
      .filter((item): item is SavedCustomWorkout => isSavedWorkout(item))
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  } catch {
    return []
  }
}

const saveCustomWorkoutsLocal = (workouts: SavedCustomWorkout[], userId?: string) => {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(getCustomWorkoutsStorageKey(userId), JSON.stringify(workouts))
}

export const saveCustomWorkoutLocal = (workout: SavedCustomWorkout, userId?: string) => {
  if (typeof window === 'undefined') {
    return
  }

  const existing = getSavedCustomWorkouts(userId)
  const next = [workout, ...existing.filter((item) => item.id !== workout.id)]
  saveCustomWorkoutsLocal(next, userId)
}

export const deleteCustomWorkoutLocal = (id: string, userId?: string) => {
  if (typeof window === 'undefined') {
    return
  }

  const next = getSavedCustomWorkouts(userId).filter((item) => item.id !== id)
  saveCustomWorkoutsLocal(next, userId)
}

const toDbPayload = (userId: string, workout: SavedCustomWorkout) => ({
  id: workout.id,
  user_id: userId,
  name: workout.name,
  mode_preset: workout.modePreset,
  execution_mode: workout.executionMode,
  selected_exercises: workout.selectedExercises,
  source_path: workout.sourcePath,
  training_path: workout.trainingPath,
  storage_key: workout.storageKey,
  created_at: workout.createdAt,
  updated_at: new Date().toISOString(),
})

const fromDbRow = (row: {
  id: string
  name: string
  mode_preset: SavedCustomWorkout['modePreset']
  execution_mode: SavedCustomWorkout['executionMode']
  selected_exercises: BuilderExercise[]
  source_path: string
  training_path: string
  storage_key: string
  created_at: string
}): SavedCustomWorkout => ({
  id: row.id,
  name: row.name,
  modePreset: row.mode_preset,
  executionMode: row.execution_mode,
  selectedExercises: Array.isArray(row.selected_exercises) ? row.selected_exercises : [],
  sourcePath: row.source_path,
  trainingPath: row.training_path,
  storageKey: row.storage_key,
  createdAt: row.created_at,
})

export const getSavedCustomWorkoutsSynced = async (userId?: string): Promise<SavedCustomWorkout[]> => {
  if (!userId) {
    return getSavedCustomWorkouts()
  }

  const { data, error } = await supabase
    .from('custom_workouts')
    .select('id, name, mode_preset, execution_mode, selected_exercises, source_path, training_path, storage_key, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    const fallback = getSavedCustomWorkouts(userId)
    return fallback
  }

  const normalized = (data ?? []).map(fromDbRow)
  saveCustomWorkoutsLocal(normalized, userId)
  return normalized
}

export const saveCustomWorkoutSynced = async (userId: string, workout: SavedCustomWorkout) => {
  const { error } = await supabase
    .from('custom_workouts')
    .upsert(toDbPayload(userId, workout), { onConflict: 'id' })

  if (error) {
    throw error
  }

  saveCustomWorkoutLocal(workout, userId)
}

export const deleteCustomWorkoutSynced = async (userId: string, id: string) => {
  const { error } = await supabase
    .from('custom_workouts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw error
  }

  deleteCustomWorkoutLocal(id, userId)
}
