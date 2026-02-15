import {
  IconPointer,
  IconTypography,
  IconSquare,
  IconCircle,
  IconPhoto,
  IconHandStop,
  IconGridDots,
  IconMagnet,
  IconDownload,
} from '@tabler/icons-react'
import { useToolStore } from '@/stores/useToolStore'
import { useDesignStore } from '@/stores/useDesignStore'
import { useExportFrame } from '@/hooks/useExportFrame'
import type { ToolType } from '@/types/tools'
import { Button } from '@/components/ui/button'
import { Toggle } from '@/components/ui/toggle'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const TOOLS: {
  type: ToolType
  icon: React.ReactNode
  label: string
  shortcut: string
}[] = [
  {
    type: 'select',
    icon: <IconPointer size={16} />,
    label: 'Select',
    shortcut: 'V',
  },
  {
    type: 'text',
    icon: <IconTypography size={16} />,
    label: 'Text',
    shortcut: 'T',
  },
  {
    type: 'rectangle',
    icon: <IconSquare size={16} />,
    label: 'Rectangle',
    shortcut: 'R',
  },
  {
    type: 'ellipse',
    icon: <IconCircle size={16} />,
    label: 'Ellipse',
    shortcut: 'O',
  },
  {
    type: 'image',
    icon: <IconPhoto size={16} />,
    label: 'Image',
    shortcut: 'I',
  },
  {
    type: 'hand',
    icon: <IconHandStop size={16} />,
    label: 'Hand',
    shortcut: 'H',
  },
]

export function Toolbar() {
  const activeTool = useToolStore.useActiveTool()
  const setTool = useToolStore.useSetTool()
  const gridEnabled = useDesignStore.useGridEnabled()
  const toggleGrid = useDesignStore.useToggleGrid()
  const snapEnabled = useDesignStore.useSnapEnabled()
  const toggleSnap = useDesignStore.useToggleSnap()

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-card border-b border-border">
      {/* ─── Tool Buttons ─── */}
      <div className="flex items-center gap-0.5">
        {TOOLS.map(({ type, icon, label, shortcut }) => (
          <Tooltip key={type}>
            <TooltipTrigger
              render={
                <Button
                  variant={activeTool === type ? 'default' : 'ghost'}
                  size="icon-sm"
                  onClick={() => setTool(type)}
                />
              }
            >
              {icon}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {label} ({shortcut})
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      <Separator orientation="vertical" className="mx-2 h-5" />

      {/* ─── Grid Toggle ─── */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle
              size="sm"
              pressed={gridEnabled}
              onPressedChange={toggleGrid}
            />
          }
        >
          <IconGridDots size={16} />
        </TooltipTrigger>
        <TooltipContent side="bottom">Toggle Grid</TooltipContent>
      </Tooltip>

      {/* ─── Snap Toggle ─── */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Toggle
              size="sm"
              pressed={snapEnabled}
              onPressedChange={toggleSnap}
            />
          }
        >
          <IconMagnet size={16} />
        </TooltipTrigger>
        <TooltipContent side="bottom">Toggle Snap</TooltipContent>
      </Tooltip>

      {/* ─── Spacer ─── */}
      <div className="flex-1" />

      {/* ─── Export Button ─── */}
      <ExportButton />

      <Separator orientation="vertical" className="mx-2 h-5" />

      {/* ─── Frame Info ─── */}
      <FrameInfo />
    </div>
  )
}

function FrameInfo() {
  const frame = useDesignStore.useFrame()
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-medium">{frame.name}</span>
      <span>
        {frame.width} × {frame.height}
      </span>
    </div>
  )
}

// ─── Export Button ───────────────────────────────────────────

function ExportButton() {
  const exportAsPng = useExportFrame()

  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="ghost" size="icon-sm" onClick={exportAsPng} />}
      >
        <IconDownload size={16} />
      </TooltipTrigger>
      <TooltipContent side="bottom">Export PNG</TooltipContent>
    </Tooltip>
  )
}
