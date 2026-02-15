import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { createSelectorHooks } from 'auto-zustand-selectors-hook'
import type {
  DesignElement,
  FramePreset,
  FrameBackground,
  AlignDirection,
  DistributeAxis,
} from '@/types/design'
import { DEFAULT_ELEMENT } from '@/types/design'
import { FRAME_PRESETS } from '@/components/frame/framePresets'
import { generateId } from '@/utils/idGenerator'

// ─── State Interface ─────────────────────────────────────────

interface DesignState {
  frame: FramePreset
  elements: DesignElement[]
  selectedIds: string[]
  gridEnabled: boolean
  gridSize: number
  snapEnabled: boolean
  canvasBackground: string // The workspace background (infinite)
  frameBackground: FrameBackground // The artboard background
}

// ─── Actions Interface ───────────────────────────────────────

interface DesignActions {
  // Element CRUD
  addElement: (partial: Partial<DesignElement>) => string
  updateElement: (id: string, patch: Partial<DesignElement>) => void
  deleteElements: (ids: string[]) => void
  duplicateElements: (ids: string[]) => void

  // Layer Ordering
  reorderElement: (fromIndex: number, toIndex: number) => void
  toggleVisibility: (id: string) => void
  toggleLock: (id: string) => void

  // Selection
  selectElement: (id: string, additive?: boolean) => void
  selectAll: () => void
  deselectAll: () => void
  setSelectedIds: (ids: string[]) => void

  // Alignment
  alignElements: (direction: AlignDirection) => void
  distributeElements: (axis: DistributeAxis) => void

  // Frame & Grid
  setFrame: (preset: FramePreset) => void
  toggleGrid: () => void
  setGridSize: (size: number) => void
  toggleSnap: () => void
  setCanvasBackground: (color: string) => void
  setFrameBackground: (bg: Partial<FrameBackground>) => void

  // Persistence
  saveToLocalStorage: () => void
  loadFromLocalStorage: () => boolean
  clearDesign: () => void
}

// ─── Local Storage Key ───────────────────────────────────────

const STORAGE_KEY = 'mockup_design'

// ─── Store ───────────────────────────────────────────────────

const useDesignStoreBase = create<DesignState & DesignActions>()(
  immer((set, get) => ({
    // ─── Initial State ───
    frame: FRAME_PRESETS[0],
    elements: [],
    selectedIds: [],
    gridEnabled: true,
    gridSize: 20,
    snapEnabled: true,
    canvasBackground: '#1e1e22',
    frameBackground: {
      type: 'solid',
      color: '#ffffff',
      gradientColors: ['#ff0000', '#0000ff'],
      gradientStops: [0, 100],
      gradientAngle: 180,
    },

    // ─── Element CRUD ────────────────────────────────────────

    addElement: (partial) => {
      const id = generateId()
      set((state) => {
        const newElement: DesignElement = {
          ...DEFAULT_ELEMENT,
          ...partial,
          id,
          zIndex: state.elements.length,
        }
        state.elements.push(newElement)
      })
      return id
    },

    updateElement: (id, patch) =>
      set((state) => {
        const el = state.elements.find((e) => e.id === id)
        if (el) Object.assign(el, patch)
      }),

    deleteElements: (ids) =>
      set((state) => {
        state.elements = state.elements.filter((e) => !ids.includes(e.id))
        state.selectedIds = state.selectedIds.filter((id) => !ids.includes(id))
      }),

    duplicateElements: (ids) =>
      set((state) => {
        const duplicates = state.elements
          .filter((e) => ids.includes(e.id))
          .map((e) => ({
            ...e,
            id: generateId(),
            name: `${e.name} (copy)`,
            x: e.x + 20,
            y: e.y + 20,
            zIndex: state.elements.length,
          }))
        state.elements.push(...duplicates)
        state.selectedIds = duplicates.map((d) => d.id)
      }),

    // ─── Layer Ordering ──────────────────────────────────────

    reorderElement: (fromIndex, toIndex) =>
      set((state) => {
        const [moved] = state.elements.splice(fromIndex, 1)
        state.elements.splice(toIndex, 0, moved)
        // Re-assign zIndex based on new position
        state.elements.forEach((el, i) => {
          el.zIndex = i
        })
      }),

    toggleVisibility: (id) =>
      set((state) => {
        const el = state.elements.find((e) => e.id === id)
        if (el) el.visible = !el.visible
      }),

    toggleLock: (id) =>
      set((state) => {
        const el = state.elements.find((e) => e.id === id)
        if (el) el.locked = !el.locked
      }),

    // ─── Selection ───────────────────────────────────────────

    selectElement: (id, additive = false) =>
      set((state) => {
        if (additive) {
          const idx = state.selectedIds.indexOf(id)
          if (idx >= 0) {
            state.selectedIds.splice(idx, 1)
          } else {
            state.selectedIds.push(id)
          }
        } else {
          state.selectedIds = [id]
        }
      }),

    selectAll: () =>
      set((state) => {
        state.selectedIds = state.elements
          .filter((e) => !e.locked)
          .map((e) => e.id)
      }),

    deselectAll: () =>
      set((state) => {
        state.selectedIds = []
      }),

    setSelectedIds: (ids) =>
      set((state) => {
        state.selectedIds = ids
      }),

    // ─── Alignment ───────────────────────────────────────────

    alignElements: (direction) =>
      set((state) => {
        const selected = state.elements.filter((e) =>
          state.selectedIds.includes(e.id),
        )
        if (selected.length === 0) return

        // Single element → align to frame. Multiple → align to group bbox.
        const refRect =
          selected.length === 1
            ? {
                x: 0,
                y: 0,
                width: state.frame.width,
                height: state.frame.height,
              }
            : {
                x: Math.min(...selected.map((e) => e.x)),
                y: Math.min(...selected.map((e) => e.y)),
                width:
                  Math.max(...selected.map((e) => e.x + e.width)) -
                  Math.min(...selected.map((e) => e.x)),
                height:
                  Math.max(...selected.map((e) => e.y + e.height)) -
                  Math.min(...selected.map((e) => e.y)),
              }

        for (const el of selected) {
          switch (direction) {
            case 'left':
              el.x = refRect.x
              break
            case 'right':
              el.x = refRect.x + refRect.width - el.width
              break
            case 'top':
              el.y = refRect.y
              break
            case 'bottom':
              el.y = refRect.y + refRect.height - el.height
              break
            case 'centerH':
              el.x = refRect.x + (refRect.width - el.width) / 2
              break
            case 'centerV':
              el.y = refRect.y + (refRect.height - el.height) / 2
              break
          }
        }
      }),

    distributeElements: (axis) =>
      set((state) => {
        const selected = state.elements.filter((e) =>
          state.selectedIds.includes(e.id),
        )
        if (selected.length < 3) return

        if (axis === 'horizontal') {
          selected.sort((a, b) => a.x - b.x)
          const first = selected[0]
          const last = selected[selected.length - 1]
          const totalWidth = selected.reduce((sum, e) => sum + e.width, 0)
          const space =
            (last.x + last.width - first.x - totalWidth) / (selected.length - 1)

          let currentX = first.x + first.width + space
          for (let i = 1; i < selected.length - 1; i++) {
            selected[i].x = currentX
            currentX += selected[i].width + space
          }
        } else {
          selected.sort((a, b) => a.y - b.y)
          const first = selected[0]
          const last = selected[selected.length - 1]
          const totalHeight = selected.reduce((sum, e) => sum + e.height, 0)
          const space =
            (last.y + last.height - first.y - totalHeight) /
            (selected.length - 1)

          let currentY = first.y + first.height + space
          for (let i = 1; i < selected.length - 1; i++) {
            selected[i].y = currentY
            currentY += selected[i].height + space
          }
        }
      }),

    // ─── Frame & Grid ────────────────────────────────────────

    setFrame: (preset) =>
      set((state) => {
        state.frame = preset
      }),

    toggleGrid: () =>
      set((state) => {
        state.gridEnabled = !state.gridEnabled
      }),

    setGridSize: (size) =>
      set((state) => {
        state.gridSize = size
      }),

    toggleSnap: () =>
      set((state) => {
        state.snapEnabled = !state.snapEnabled
      }),

    setCanvasBackground: (color) =>
      set((state) => {
        state.canvasBackground = color
      }),

    setFrameBackground: (bg) =>
      set((state) => {
        // Merge shallow updates
        Object.assign(state.frameBackground, bg)
      }),

    // ─── Persistence ─────────────────────────────────────────

    saveToLocalStorage: () => {
      const {
        frame,
        elements,
        gridEnabled,
        gridSize,
        snapEnabled,
        canvasBackground,
        frameBackground,
      } = get()
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            frame,
            elements,
            gridEnabled,
            gridSize,
            snapEnabled,
            canvasBackground,
            frameBackground,
          }),
        )
      } catch {
        console.warn('[DesignStore] Failed to save to localStorage')
      }
    },

    loadFromLocalStorage: () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return false
        const data = JSON.parse(raw) as Partial<DesignState>
        set((state) => {
          if (data.frame) state.frame = data.frame
          if (data.elements) state.elements = data.elements
          if (data.gridEnabled !== undefined)
            state.gridEnabled = data.gridEnabled
          if (data.gridSize !== undefined) state.gridSize = data.gridSize
          if (data.snapEnabled !== undefined)
            state.snapEnabled = data.snapEnabled
          if (data.canvasBackground !== undefined)
            state.canvasBackground = data.canvasBackground
          if (data.frameBackground) state.frameBackground = data.frameBackground
        })
        return true
      } catch {
        console.warn('[DesignStore] Failed to load from localStorage')
        return false
      }
    },

    clearDesign: () =>
      set((state) => {
        state.elements = []
        state.selectedIds = []
      }),
  })),
)

// ─── Export with Auto-Selectors ──────────────────────────────

export const useDesignStore = createSelectorHooks(useDesignStoreBase)
