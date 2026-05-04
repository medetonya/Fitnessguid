import { Dumbbell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Exercise, TrainingProgram } from '../types/index'

interface ProgramExerciseView {
  order: number
  sets: number
  reps: number
  exercise: Exercise
}

export default function ProgramDetailsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { programId } = useParams<{ programId: string }>()
  const [program, setProgram] = useState<TrainingProgram | null>(null)
  const [items, setItems] = useState<ProgramExerciseView[]>([])
  const [currentDay, setCurrentDay] = useState<number | null>(null)
  const [progressStatus, setProgressStatus] = useState<'active' | 'completed' | 'paused' | null>(null)
  const [savingProgress, setSavingProgress] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!programId) {
      setLoading(false)
      setError('Program not found')
      return
    }

    const fetchProgram = async () => {
      try {
        setLoading(true)
        setError(null)

        const [{ data: programRow, error: programError }, { data: relationRows, error: relationError }] =
          await Promise.all([
            supabase.from('training_programs').select('*').eq('id', programId).single(),
            supabase
              .from('program_exercises')
              .select('order, sets, reps, exercises(id, name, description, image_url, video_url, created_at)')
              .eq('program_id', programId)
              .order('order', { ascending: true }),
          ])

            const progressQuery = user
              ? await supabase
                .from('user_progress')
                .select('current_day, status')
                .eq('program_id', programId)
                .eq('user_id', user.id)
                .maybeSingle()
              : null

        if (programError) {
          throw programError
        }

        if (relationError) {
          throw relationError
        }

        if (progressQuery?.error) {
          throw progressQuery.error
        }

        setProgram({
          id: programRow.id,
          name: programRow.name,
          description: programRow.description ?? '',
          duration: programRow.duration ?? 0,
          difficulty: programRow.difficulty,
          imageUrl: programRow.image_url ?? undefined,
          createdAt: programRow.created_at,
        })

        const mappedItems: ProgramExerciseView[] = (relationRows ?? [])
          .filter((row) => row.exercises)
          .map((row) => {
            const exercise = Array.isArray(row.exercises) ? row.exercises[0] : row.exercises

            return {
              order: row.order,
              sets: row.sets,
              reps: row.reps,
              exercise: {
                id: exercise.id,
                name: exercise.name,
                description: exercise.description ?? '',
                imageUrl: exercise.image_url ?? undefined,
                videoUrl: exercise.video_url ?? undefined,
                createdAt: exercise.created_at,
              },
            }
          })

        setItems(mappedItems)

        setCurrentDay(progressQuery?.data?.current_day ?? null)
        setProgressStatus(progressQuery?.data?.status ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load program details')
      } finally {
        setLoading(false)
      }
    }

    fetchProgram()
  }, [programId, user])

  const handleCompleteDay = async () => {
    if (!user || !programId || !program) {
      return
    }

    try {
      setSavingProgress(true)
      setError(null)

      const nextDay = Math.max(1, (currentDay ?? 1) + 1)
      const isCompleted = program.duration > 0 && nextDay >= program.duration

      const { error: updateError } = await supabase
        .from('user_progress')
        .upsert(
          {
            user_id: user.id,
            program_id: programId,
            current_day: isCompleted ? program.duration : nextDay,
            status: isCompleted ? 'completed' : 'active',
            completed_at: isCompleted ? new Date().toISOString() : null,
          },
          { onConflict: 'user_id,program_id' }
        )

      if (updateError) {
        throw updateError
      }

      setCurrentDay(isCompleted ? program.duration : nextDay)
      setProgressStatus(isCompleted ? 'completed' : 'active')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress')
    } finally {
      setSavingProgress(false)
    }
  }

  if (loading) {
    return (
      <div className="flex-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-[#111111]"></div>
          <p className="mt-4 text-gray-600">Loading program...</p>
        </div>
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="flex-center min-h-screen bg-gray-50 px-4">
        <div className="card max-w-lg text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Unable to load program</h1>
          <p className="mb-6 text-gray-600">{error ?? 'Unknown error'}</p>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-primary inline-block"
          >
            Come back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container-max py-10">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-6 inline-block text-sm font-medium text-[#111111] hover:text-[#0f0f10]"
        >
          ← Come back
        </button>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-[280px,1fr]">
            <div className="h-56 overflow-hidden rounded-xl bg-gray-100">
              {program.imageUrl ? (
                <img src={program.imageUrl} alt={program.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex-center h-full w-full bg-gradient-to-br from-[#efefef] to-[#e8e8e8] text-[#111111]">
                  <Dumbbell size={34} />
                </div>
              )}
            </div>
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">{program.name}</h1>
              <p className="mb-4 text-gray-700">{program.description}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                  Difficulty: {program.difficulty}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">
                  Duration: {program.duration ? `${program.duration} days` : 'Custom'}
                </span>
                {currentDay !== null && (
                  <span className="rounded-full bg-[#e8e8e8] px-3 py-1 text-[#111111]">
                    Current day: {currentDay}
                  </span>
                )}
                {progressStatus && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 capitalize text-gray-700">
                    Status: {progressStatus}
                  </span>
                )}
              </div>

              {progressStatus !== 'completed' && (
                <button
                  onClick={handleCompleteDay}
                  disabled={savingProgress}
                  className="btn-primary mt-5"
                >
                  {savingProgress ? 'Saving...' : 'Complete day'}
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Exercises</h2>

          {items.length === 0 ? (
            <p className="text-gray-600">No exercises assigned to this program yet.</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <article key={`${item.exercise.id}-${item.order}`} className="rounded-xl border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.order}. {item.exercise.name}
                    </h3>
                    <span className="rounded-full bg-[#e8e8e8] px-3 py-1 text-xs font-medium text-[#111111]">
                      {item.sets} sets x {item.reps} reps
                    </span>
                  </div>

                  <p className="mb-3 text-sm text-gray-600">{item.exercise.description}</p>

                  {item.exercise.videoUrl && (
                    <a
                      href={item.exercise.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[#111111] hover:text-[#0f0f10]"
                    >
                      Watch video
                    </a>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
