import { Info, X } from 'lucide-react'
import { useMemo, useState } from 'react'

interface TechniqueQuickCardProps {
  exerciseName: string
  techniqueText?: string
  language: string
}

export default function TechniqueQuickCard({ exerciseName, techniqueText, language }: TechniqueQuickCardProps) {
  const [open, setOpen] = useState(false)

  const labels = useMemo(() => {
    const isRu = language === 'ru'

    return {
      open: isRu ? 'Техника' : 'Technique',
      close: isRu ? 'Закрыть' : 'Close',
      title: isRu ? 'Техника выполнения' : 'Exercise Technique',
      empty: isRu ? 'Техника для этого упражнения пока недоступна.' : 'Technique is not available for this exercise yet.',
      cardTitle: isRu ? `Техника: ${exerciseName}` : `Technique: ${exerciseName}`,
    }
  }, [exerciseName, language])

  return (
    <div className="relative mt-3 flex justify-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-2xl border border-[#d4d4d8] bg-white px-4 py-3 text-sm font-semibold text-[#111111] shadow-sm"
      >
        <Info size={16} />
        {labels.open}
      </button>

      {open && (
        <aside className="absolute left-1/2 z-40 mt-14 w-[min(420px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-[#d4d4d8] bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#111111]">{labels.title}</p>
              <p className="mt-1 text-xs text-[#52525b]">{labels.cardTitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d4d4d8] text-[#111111]"
              aria-label={labels.close}
            >
              <X size={14} />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-auto rounded-xl border border-[#e4e4e7] bg-[#f9f9f9] p-3">
            {techniqueText ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-[#111111]">{techniqueText}</p>
            ) : (
              <p className="text-sm text-[#52525b]">{labels.empty}</p>
            )}
          </div>
        </aside>
      )}
    </div>
  )
}
