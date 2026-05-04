import { X } from 'lucide-react'
import { getMotivationMessage, getMotivationRewardHint, type MotivationLanguage } from '../lib/motivationProgress'

interface MotivationDayPopupProps {
  day: number
  language: MotivationLanguage
  onClose: () => void
}

export default function MotivationDayPopup({ day, language, onClose }: MotivationDayPopupProps) {
  const message = getMotivationMessage(day, language)

  if (!message) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-[#d4d4d8] bg-[#f1f1f1] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#52525b]">Day {day}</p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d4d4d8] bg-white text-[#111111]"
            aria-label="Close motivation popup"
          >
            <X size={16} />
          </button>
        </div>

        <h3 className="text-2xl font-black text-[#111111]">{message.title}</h3>
        <p className="mt-3 text-base text-[#111111]">{message.description}</p>
        <p className="mt-1 text-base font-semibold text-[#111111]">{message.emotion}</p>

        <p className="mt-4 rounded-xl border border-[#d4d4d8] bg-white px-3 py-2 text-xs font-medium text-[#52525b]">
          {getMotivationRewardHint(language)}
        </p>
      </div>
    </div>
  )
}
