import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { FRAME_PRESETS } from '@/components/frame/framePresets'
import { useDesignStore } from '@/stores/useDesignStore'
import type { FramePreset, FrameCategory } from '@/types/design'
import {
  IconFileTypePdf,
  IconBrandInstagram,
  IconPresentation,
  IconDimensions,
} from '@tabler/icons-react'

export const Route = createFileRoute('/')({ component: FrameSelectionPage })

const CATEGORY_META: Record<
  FrameCategory,
  { label: string; icon: React.ReactNode }
> = {
  print: { label: 'Print', icon: <IconFileTypePdf size={18} /> },
  social: { label: 'Social Media', icon: <IconBrandInstagram size={18} /> },
  presentation: { label: 'Presentation', icon: <IconPresentation size={18} /> },
  custom: { label: 'Custom', icon: <IconDimensions size={18} /> },
}

function FrameSelectionPage() {
  const navigate = useNavigate()
  const setFrame = useDesignStore.useSetFrame()
  const clearDesign = useDesignStore.useClearDesign()
  const saveToLocalStorage = useDesignStore.useSaveToLocalStorage()

  const handleSelect = (preset: FramePreset) => {
    // 1. Clear previous design
    clearDesign()

    // 2. Set new frame
    setFrame(preset)

    // 3. Persist immediately so we don't load stale data on refresh
    saveToLocalStorage()

    navigate({ to: '/editor' })
  }

  const categories = Object.keys(CATEGORY_META) as FrameCategory[]

  return (
    <div className="min-h-screen bg-[#1a1a1e] text-white flex flex-col items-center justify-center p-8">
      {/* ─── Header ─── */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Mockup Studio
        </h1>
        <p className="text-white/40 text-sm">
          Choose a frame to start designing
        </p>
      </div>

      {/* ─── Frame Grid ─── */}
      <div className="w-full max-w-4xl space-y-8">
        {categories.map((cat) => {
          const presets = FRAME_PRESETS.filter((p) => p.category === cat)
          if (presets.length === 0) return null
          const meta = CATEGORY_META[cat]

          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-white/40">{meta.icon}</span>
                <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                  {meta.label}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {presets.map((preset) => (
                  <FrameCard
                    key={preset.id}
                    preset={preset}
                    onClick={() => handleSelect(preset)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FrameCard({
  preset,
  onClick,
}: {
  preset: FramePreset
  onClick: () => void
}) {
  const aspect = preset.width / preset.height
  const thumbW = 80
  const thumbH = thumbW / aspect

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail */}
      <div
        className="bg-white/10 rounded border border-white/10 group-hover:border-primary/20 transition-colors"
        style={{
          width: `${thumbW}px`,
          height: `${Math.min(thumbH, 100)}px`,
        }}
      />
      {/* Info */}
      <div className="text-center">
        <div className="text-xs font-medium text-white/70 group-hover:text-white/90 transition-colors">
          {preset.name}
        </div>
        <div className="text-[10px] text-white/30">
          {preset.width} × {preset.height}
        </div>
      </div>
    </button>
  )
}
