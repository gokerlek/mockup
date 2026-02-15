import {
  IconEye,
  IconEyeOff,
  IconLock,
  IconLockOpen,
  IconTypography,
  IconSquare,
  IconPhoto,
  IconLayersSubtract,
} from '@tabler/icons-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useDesignStore } from '@/stores/useDesignStore'
import type { DesignElement } from '@/types/design'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function LayersPanel() {
  const elements = useDesignStore.useElements()
  const reorderElement = useDesignStore.useReorderElement()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Layers panel shows elements in reverse order (top = highest z)
  const reversedElements = [...elements].reverse()
  const reversedIds = reversedElements.map((el) => el.id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldReversedIndex = reversedIds.indexOf(active.id as string)
    const newReversedIndex = reversedIds.indexOf(over.id as string)

    const oldIndex = elements.length - 1 - oldReversedIndex
    const newIndex = elements.length - 1 - newReversedIndex

    reorderElement(oldIndex, newIndex)
  }

  return (
    <div className="w-60 bg-card border-r border-border flex flex-col">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <IconLayersSubtract size={16} className="text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Layers
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground/50">
          {elements.length}
        </span>
      </div>

      {/* ─── Layer List ─── */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {elements.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-xs text-muted-foreground/40">
              No elements yet
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={reversedIds}
                strategy={verticalListSortingStrategy}
              >
                {reversedElements.map((el) => (
                  <LayerItem key={el.id} element={el} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ─── Layer Item ──────────────────────────────────────────────

function LayerItem({ element }: { element: DesignElement }) {
  const selectedIds = useDesignStore.useSelectedIds()
  const selectElement = useDesignStore.useSelectElement()
  const toggleVisibility = useDesignStore.useToggleVisibility()
  const toggleLock = useDesignStore.useToggleLock()

  const isSelected = selectedIds.includes(element.id)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const typeIcon =
    element.type === 'text' ? (
      <IconTypography size={14} />
    ) : element.type === 'image' ? (
      <IconPhoto size={14} />
    ) : (
      <IconSquare size={14} />
    )

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => selectElement(element.id, e.shiftKey)}
      className={`
        flex items-center gap-2 px-3 py-1.5 mx-1 rounded-md cursor-pointer
        transition-colors duration-100 group
        ${isSelected ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-muted'}
        ${!element.visible ? 'opacity-40' : ''}
      `}
    >
      {/* Type Icon */}
      <span className="shrink-0 text-muted-foreground">{typeIcon}</span>

      {/* Name */}
      <span className="flex-1 text-xs truncate">{element.name}</span>

      {/* Visibility */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                toggleVisibility(element.id)
              }}
            />
          }
        >
          {element.visible ? <IconEye size={12} /> : <IconEyeOff size={12} />}
        </TooltipTrigger>
        <TooltipContent side="right">
          {element.visible ? 'Hide' : 'Show'}
        </TooltipContent>
      </Tooltip>

      {/* Lock */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                toggleLock(element.id)
              }}
            />
          }
        >
          {element.locked ? <IconLock size={12} /> : <IconLockOpen size={12} />}
        </TooltipTrigger>
        <TooltipContent side="right">
          {element.locked ? 'Unlock' : 'Lock'}
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
