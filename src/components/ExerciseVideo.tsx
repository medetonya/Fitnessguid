interface ExerciseVideoProps {
  videoUrl?: string
  title: string
}

const getYouTubeId = (url: string): string | null => {
  const trimmed = url.trim()

  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)
  if (shortMatch?.[1]) {
    return shortMatch[1]
  }

  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)
  if (watchMatch?.[1]) {
    return watchMatch[1]
  }

  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/)
  if (embedMatch?.[1]) {
    return embedMatch[1]
  }

  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/)
  if (shortsMatch?.[1]) {
    return shortsMatch[1]
  }

  return null
}

const isDirectVideoFile = (url: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
const isImageFile = (url: string) => /\.(gif|png|jpe?g|webp|avif)(\?.*)?$/i.test(url)
const isMutedByRule = (url: string) => /homesquat|bodyweight-squat/i.test(url)

export default function ExerciseVideo({ videoUrl, title }: ExerciseVideoProps) {
  if (!videoUrl) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-[#d4d4d8] bg-[#f5f5f5] p-4 text-sm text-[#52525b]">
        Video is not added yet for this exercise.
      </div>
    )
  }

  const youtubeId = getYouTubeId(videoUrl)

  if (youtubeId) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#d4d4d8] bg-black">
        <div className="aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1&fs=0`}
            title={`${title} technique video`}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    )
  }

  if (isDirectVideoFile(videoUrl) || /\.mov(\?.*)?$/i.test(videoUrl)) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#d4d4d8] bg-black">
        <video
          controls
          playsInline
          controlsList="nofullscreen noremoteplayback nodownload"
          disablePictureInPicture
          muted={isMutedByRule(videoUrl)}
          preload="metadata"
          className="aspect-video w-full"
          src={videoUrl}
        >
          Your browser does not support HTML5 video.
        </video>
      </div>
    )
  }

  if (isImageFile(videoUrl)) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-[#d4d4d8] bg-black">
        <img
          src={videoUrl}
          alt={`${title} technique image`}
          loading="lazy"
          className="aspect-video w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#d4d4d8] bg-[#f5f5f5] p-4 text-sm text-[#52525b]">
      <p className="font-semibold text-[#0f0f10]">Open video</p>
      <a href={videoUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex text-[#111111] underline underline-offset-2">
        {videoUrl}
      </a>
    </div>
  )
}
