import { useEffect, useCallback } from 'react'
import { useDesignStore } from '@/stores/useDesignStore'
import { useToolStore } from '@/stores/useToolStore'
import type { ToolType } from '@/types/tools'

// ─── Tool Shortcut Map ──────────────────────────────────────

const TOOL_SHORTCUTS: Record<string, ToolType> = {
  v: 'select',
  t: 'text',
  r: 'rectangle',
  o: 'ellipse',
  i: 'image',
  h: 'hand',
}

export function useKeyboardShortcuts() {
  const setTool = useToolStore.useSetTool()
  const isEditing = useToolStore.useIsEditing()

  const deleteElements = useDesignStore.useDeleteElements()
  const duplicateElements = useDesignStore.useDuplicateElements()
  const selectedIds = useDesignStore.useSelectedIds()
  const selectAll = useDesignStore.useSelectAll()
  const deselectAll = useDesignStore.useDeselectAll()
  const saveToLocalStorage = useDesignStore.useSaveToLocalStorage()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't process shortcuts when editing text
      if (isEditing) return

      // Don't process when typing in inputs
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      const key = e.key.toLowerCase()
      const cmd = e.metaKey || e.ctrlKey

      // ─── Tool Shortcuts (single key press) ───
      if (!cmd && !e.shiftKey && !e.altKey && TOOL_SHORTCUTS[key]) {
        e.preventDefault()
        setTool(TOOL_SHORTCUTS[key])
        return
      }

      // ─── Delete / Backspace ───
      if ((key === 'delete' || key === 'backspace') && selectedIds.length > 0) {
        e.preventDefault()
        deleteElements(selectedIds)
        return
      }

      // ─── Cmd+A → Select All ───
      if (cmd && key === 'a') {
        e.preventDefault()
        selectAll()
        return
      }

      // ─── Cmd+D → Duplicate ───
      if (cmd && key === 'd' && selectedIds.length > 0) {
        e.preventDefault()
        duplicateElements(selectedIds)
        return
      }

      // ─── Cmd+S → Save ───
      if (cmd && key === 's') {
        e.preventDefault()
        saveToLocalStorage()
        return
      }

      // ─── Escape → Deselect ───
      if (key === 'escape') {
        e.preventDefault()
        deselectAll()
        setTool('select')
        return
      }
    },
    [
      isEditing,
      selectedIds,
      setTool,
      deleteElements,
      duplicateElements,
      selectAll,
      deselectAll,
      saveToLocalStorage,
    ],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
