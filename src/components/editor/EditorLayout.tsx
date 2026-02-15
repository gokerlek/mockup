import { LayersPanel } from '@/components/layers/LayersPanel'
import { PropertiesPanel } from '@/components/properties/PropertiesPanel'
import { Toolbar } from '@/components/editor/Toolbar'
import { DesignCanvas } from '@/components/canvas/DesignCanvas'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { TooltipProvider } from '@/components/ui/tooltip'

import { useEffect } from 'react'
import { useDesignStore } from '@/stores/useDesignStore'

export function EditorLayout() {
  const loadFromLocalStorage = useDesignStore.useLoadFromLocalStorage()

  useEffect(() => {
    loadFromLocalStorage()
  }, [loadFromLocalStorage])

  useAutoSave()
  useKeyboardShortcuts()

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
        {/* ─── Top Toolbar ─── */}
        <Toolbar />

        {/* ─── Main Content (3-panel) ─── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ─── Left: Layers Panel ─── */}
          <LayersPanel />

          {/* ─── Center: Canvas ─── */}
          <div className="flex-1 relative overflow-hidden">
            <DesignCanvas />
          </div>

          {/* ─── Right: Properties Panel ─── */}
          <PropertiesPanel />
        </div>
      </div>
    </TooltipProvider>
  )
}
