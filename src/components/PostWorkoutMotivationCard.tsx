import { getMotivationMessage } from '../lib/motivationProgress'

interface PostWorkoutMotivationCardProps {
  workoutNumber: number
  language: 'ru' | 'en'
}

const getCycleDay = (workoutNumber: number) => {
  if (workoutNumber <= 0) {
    return 1
  }

  return ((workoutNumber - 1) % 36) + 1
}

export default function PostWorkoutMotivationCard({ workoutNumber, language }: PostWorkoutMotivationCardProps) {
  if (!Number.isFinite(workoutNumber) || workoutNumber <= 0) {
    return null
  }

  const isRussian = language === 'ru'
  const message = getMotivationMessage(getCycleDay(workoutNumber), language)
  const markerIndex = (workoutNumber - 1) % 11

  return (
    <article className="mt-7 rounded-3xl border border-[#d4d4d8] bg-white p-5 text-left sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#52525b]">
        {isRussian ? 'Мотивация' : 'Motivation'}
      </p>

      <h3 className="mt-4 font-serif text-4xl leading-tight text-[#111111] sm:text-5xl">
        {isRussian ? `Тренировка ${workoutNumber}` : `Workout ${workoutNumber}`}
      </h3>

      <p className="mt-2 text-base font-medium text-[#52525b] sm:text-lg">
        {isRussian ? 'Ты уже в процессе' : 'You\'re building momentum'}
      </p>

      <div className="mt-5 flex items-center gap-2" aria-hidden>
        {Array.from({ length: 11 }).map((_, index) => (
          <span
            key={`momentum-dot-${index}`}
            className={`h-2.5 w-2.5 rounded-full ${index === markerIndex ? 'bg-[#9d174d]' : 'bg-[#d4d4d8]'}`}
          />
        ))}
      </div>

      <h4 className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#9d174d]">
        {message.title}
      </h4>

      <p className="mt-3 text-base leading-relaxed text-[#111111] sm:text-lg">{message.description}</p>
      <p className="mt-1 text-base leading-relaxed text-[#52525b] sm:text-lg">{message.emotion}</p>
    </article>
  )
}
