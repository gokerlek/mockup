import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createSelectorHooks } from 'auto-zustand-selectors-hook'
import type { ToolType } from '@/types/tools'

// ─── State Interface ─────────────────────────────────────────

interface ToolState {
  activeTool: ToolType
  isEditing: boolean // inline text editing active?
  isPanning: boolean // space+drag panning active?
}

// ─── Actions Interface ───────────────────────────────────────

interface ToolActions {
  setTool: (tool: ToolType) => void
  setEditing: (value: boolean) => void
  setPanning: (value: boolean) => void
}

// ─── Store ───────────────────────────────────────────────────

const useToolStoreBase = create<ToolState & ToolActions>()(
  immer((set) => ({
    activeTool: 'select',
    isEditing: false,
    isPanning: false,

    setTool: (tool) =>
      set((state) => {
        state.activeTool = tool
        state.isEditing = false
      }),

    setEditing: (value) =>
      set((state) => {
        state.isEditing = value
      }),

    setPanning: (value) =>
      set((state) => {
        state.isPanning = value
      }),
  })),
)

// ─── Export with Auto-Selectors ──────────────────────────────

export const useToolStore = createSelectorHooks(useToolStoreBase)
