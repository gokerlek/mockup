import { useEffect, useRef } from 'react'
import { useDesignStore } from '@/stores/useDesignStore'

const DEBOUNCE_MS = 2000

/**
 * Auto-saves design state to localStorage with debounce.
 * Should be mounted once in the EditorLayout.
 */
export function useAutoSave() {
  const elements = useDesignStore.useElements()
  const frame = useDesignStore.useFrame()
  const gridEnabled = useDesignStore.useGridEnabled()
  const gridSize = useDesignStore.useGridSize()
  const saveToLocalStorage = useDesignStore.useSaveToLocalStorage()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounced save on state changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      saveToLocalStorage()
    }, DEBOUNCE_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [elements, frame, gridEnabled, gridSize, saveToLocalStorage])

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToLocalStorage()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saveToLocalStorage])
}
