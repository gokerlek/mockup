import type { FramePreset } from '@/types/design'

export const FRAME_PRESETS: FramePreset[] = [
  // ─── Print ───
  {
    id: 'a4-p',
    name: 'A4 Portrait',
    width: 794,
    height: 1123,
    category: 'print',
  },
  {
    id: 'a4-l',
    name: 'A4 Landscape',
    width: 1123,
    height: 794,
    category: 'print',
  },
  {
    id: 'a5-p',
    name: 'A5 Portrait',
    width: 559,
    height: 794,
    category: 'print',
  },
  {
    id: 'a5-l',
    name: 'A5 Landscape',
    width: 794,
    height: 559,
    category: 'print',
  },
  {
    id: 'letter',
    name: 'US Letter',
    width: 816,
    height: 1056,
    category: 'print',
  },

  // ─── Social Media ───
  {
    id: 'ig-p',
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    category: 'social',
  },
  {
    id: 'ig-s',
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    category: 'social',
  },
  {
    id: 'fb-c',
    name: 'Facebook Cover',
    width: 820,
    height: 312,
    category: 'social',
  },
  {
    id: 'tw-p',
    name: 'Twitter Post',
    width: 1200,
    height: 675,
    category: 'social',
  },
  {
    id: 'yt-t',
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    category: 'social',
  },

  // ─── Presentation ───
  {
    id: 'pres-16',
    name: 'Presentation 16:9',
    width: 1920,
    height: 1080,
    category: 'presentation',
  },
  {
    id: 'pres-4',
    name: 'Presentation 4:3',
    width: 1024,
    height: 768,
    category: 'presentation',
  },

  // ─── Custom ───
  { id: 'custom', name: 'Custom', width: 800, height: 600, category: 'custom' },
]

export const getPresetById = (id: string): FramePreset =>
  FRAME_PRESETS.find((p) => p.id === id) ?? FRAME_PRESETS[0]

export const getPresetsByCategory = (
  category: FramePreset['category'],
): FramePreset[] => FRAME_PRESETS.filter((p) => p.category === category)
