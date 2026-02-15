import { memo, useCallback, useState, useRef } from 'react'
import { Html } from '@react-three/drei'
import type { DesignElement } from '@/types/design'
import { useDesignStore } from '@/stores/useDesignStore'
import { useToolStore } from '@/stores/useToolStore'
import type { ThreeEvent } from '@react-three/fiber'
import { RichTextEditor } from '@/components/editor/RichTextEditor'
import { TooltipProvider } from '@/components/ui/tooltip'

interface CanvasElementProps {
  element: DesignElement
  order: number
}

export const CanvasElement = memo(function CanvasElement({
  element,
  order,
}: CanvasElementProps) {
  const selectElement = useDesignStore.useSelectElement()
  const updateElement = useDesignStore.useUpdateElement()
  const selectedIds = useDesignStore.useSelectedIds()
  const activeTool = useToolStore.useActiveTool()
  const setEditing = useToolStore.useSetEditing()

  const isSelected = selectedIds.includes(element.id)
  const [isTextEditing, setIsTextEditing] = useState(false)

  // ─── Drag State ───
  const isDragging = useRef(false)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 })

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      if (element.locked || activeTool !== 'select') return
      // Don't re-select if we were just dragging
      if (isDragging.current) return
      selectElement(element.id, e.nativeEvent.shiftKey)
    },
    [element.id, element.locked, activeTool, selectElement],
  )

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (element.type === 'text' && !element.locked) {
        setIsTextEditing(true)
        setEditing(true)
      }
    },
    [element.type, element.locked, setEditing],
  )

  const handleTextBlur = useCallback(() => {
    setIsTextEditing(false)
    setEditing(false)
  }, [setEditing])

  // ─── Drag Handlers ───
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (element.locked || isTextEditing || activeTool !== 'select') return
      if (e.button !== 0) return // left click only

      e.stopPropagation()
      e.preventDefault()

      // Select the element if not already selected
      if (!selectedIds.includes(element.id)) {
        selectElement(element.id, e.shiftKey)
      }

      isDragging.current = false
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        elX: element.x,
        elY: element.y,
      }

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - dragStart.current.mouseX
        const dy = ev.clientY - dragStart.current.mouseY

        if (!isDragging.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
          isDragging.current = true
        }

        if (isDragging.current) {
          // We need to account for the camera zoom
          // The canvas uses an orthographic camera, so movement is 1:1 at zoom 1
          updateElement(element.id, {
            x: Math.round(dragStart.current.elX + dx),
            y: Math.round(dragStart.current.elY + dy),
          })
        }
      }

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)

        // Reset isDragging after a frame to prevent click handler from firing
        requestAnimationFrame(() => {
          isDragging.current = false
        })
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [
      element.id,
      element.x,
      element.y,
      element.locked,
      isTextEditing,
      activeTool,
      selectedIds,
      selectElement,
      updateElement,
    ],
  )

  // ─── Resize Handlers ───
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, anchor: string) => {
      if (element.locked) return
      e.stopPropagation()
      e.preventDefault()

      const startX = e.clientX
      const startY = e.clientY
      const startWidth = element.width
      const startHeight = element.height
      const startElX = element.x
      const startElY = element.y

      const handleMouseMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX
        const dy = ev.clientY - startY

        let newX = startElX
        let newY = startElY
        let newW = startWidth
        let newH = startHeight

        if (anchor.includes('e')) {
          newW = Math.max(20, startWidth + dx)
        }
        if (anchor.includes('w')) {
          newW = Math.max(20, startWidth - dx)
          newX = startElX + startWidth - newW
        }
        if (anchor.includes('s')) {
          newH = Math.max(20, startHeight + dy)
        }
        if (anchor.includes('n')) {
          newH = Math.max(20, startHeight - dy)
          newY = startElY + startHeight - newH
        }

        updateElement(element.id, {
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        })
      }

      const handleMouseUp = () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [
      element.id,
      element.x,
      element.y,
      element.width,
      element.height,
      element.locked,
      updateElement,
    ],
  )

  if (!element.visible) return null

  // Convert screen coords to R3F coords (Y inverted)
  const posX = element.x + element.width / 2
  const posY = -(element.y + element.height / 2)
  const posZ = (order + 1) * 0.01

  // CSS 3D transform for perspective rotation
  const hasRotation =
    element.rotateX !== 0 || element.rotateY !== 0 || element.rotateZ !== 0
  const rotateXDeg = (element.rotateX * 180) / Math.PI
  const rotateYDeg = (element.rotateY * 180) / Math.PI
  const rotateZDeg = (element.rotateZ * 180) / Math.PI

  // Shadow CSS
  const shadowStyle = element.shadowEnabled
    ? `${element.shadowOffsetX}px ${element.shadowOffsetY}px ${element.shadowBlur}px ${element.shadowColor}`
    : undefined

  // Extra height for reflection rendering
  const reflectionExtraH = element.reflectionEnabled
    ? element.height * (element.reflectionHeight / 100) +
      element.reflectionDistance
    : 0

  return (
    <group position={[posX, posY, posZ]} onClick={handleClick}>
      <Html
        center
        style={{
          zIndex: 100 + order,
          width: `${element.width}px`,
          height: `${element.height + reflectionExtraH}px`,
          pointerEvents: element.locked ? 'none' : 'auto',
          userSelect: isTextEditing ? 'text' : 'none',
          perspective:
            hasRotation && (element.perspective ?? 0) > 0
              ? `${element.perspective}px`
              : undefined,
        }}
      >
        {/* ─── Rotation wrapper: element + reflection rotate together ─── */}
        <div
          style={{
            width: `${element.width}px`,
            transform: hasRotation
              ? `rotateX(${rotateXDeg}deg) rotateY(${rotateYDeg}deg) rotateZ(${rotateZDeg}deg)`
              : undefined,
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="relative"
            style={{
              width: `${element.width}px`,
              height: `${element.height}px`,
              opacity: element.opacity,
              cursor:
                activeTool === 'select' && !element.locked ? 'move' : 'default',
              boxShadow: shadowStyle,
              borderRadius: element.borderRadius,
            }}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleMouseDown}
          >
            {/* ─── Shape Rendering ─── */}
            {element.type === 'shape' && <ShapeRenderer element={element} />}

            {/* ─── Text Rendering ─── */}
            {element.type === 'text' &&
              (isTextEditing ? (
                <TooltipProvider>
                  <RichTextEditor
                    elementId={element.id}
                    initialContent={element.content}
                    style={{
                      fontFamily: element.fontFamily,
                      fontSize: `${element.fontSize}px`,
                      fontWeight: element.fontWeight,
                      lineHeight: element.lineHeight,
                      letterSpacing: `${element.letterSpacing}px`,
                      textAlign: element.textAlign,
                      color: element.color,
                      backgroundColor:
                        element.fill !== 'transparent'
                          ? element.fill
                          : undefined,
                      borderRadius: element.borderRadius,
                      padding: '4px',
                    }}
                    onBlur={handleTextBlur}
                  />
                </TooltipProvider>
              ) : (
                <TextRenderer element={element} />
              ))}

            {/* ─── Image Rendering ─── */}
            {element.type === 'image' && <ImageRenderer element={element} />}

            {/* ─── Selection Outline + Resize Handles ─── */}
            {isSelected && (
              <>
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    border: `2px solid ${isTextEditing ? '#22c55e' : '#4A90D9'}`,
                    borderRadius: element.borderRadius,
                  }}
                />
                {!isTextEditing && (
                  <ResizeHandles onResizeStart={handleResizeStart} />
                )}
              </>
            )}
          </div>

          {/* ─── Reflection (inside rotation wrapper) ─── */}
          {element.reflectionEnabled && (
            <ReflectionRenderer element={element} />
          )}
        </div>
      </Html>
    </group>
  )
})

// ─── Resize Handles ──────────────────────────────────────────

const HANDLE_SIZE = 8
const HANDLES = [
  {
    anchor: 'nw',
    cursor: 'nwse-resize',
    style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
  },
  {
    anchor: 'ne',
    cursor: 'nesw-resize',
    style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
  },
  {
    anchor: 'sw',
    cursor: 'nesw-resize',
    style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 },
  },
  {
    anchor: 'se',
    cursor: 'nwse-resize',
    style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 },
  },
  {
    anchor: 'n',
    cursor: 'ns-resize',
    style: { top: -HANDLE_SIZE / 2, left: '50%', marginLeft: -HANDLE_SIZE / 2 },
  },
  {
    anchor: 's',
    cursor: 'ns-resize',
    style: {
      bottom: -HANDLE_SIZE / 2,
      left: '50%',
      marginLeft: -HANDLE_SIZE / 2,
    },
  },
  {
    anchor: 'w',
    cursor: 'ew-resize',
    style: { left: -HANDLE_SIZE / 2, top: '50%', marginTop: -HANDLE_SIZE / 2 },
  },
  {
    anchor: 'e',
    cursor: 'ew-resize',
    style: { right: -HANDLE_SIZE / 2, top: '50%', marginTop: -HANDLE_SIZE / 2 },
  },
]

function ResizeHandles({
  onResizeStart,
}: {
  onResizeStart: (e: React.MouseEvent, anchor: string) => void
}) {
  return (
    <>
      {HANDLES.map(({ anchor, cursor, style }) => (
        <div
          key={anchor}
          className="absolute"
          style={{
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            backgroundColor: '#fff',
            border: '1.5px solid #4A90D9',
            borderRadius: 2,
            cursor,
            zIndex: 10,
            ...style,
          }}
          onMouseDown={(e) => onResizeStart(e, anchor)}
        />
      ))}
    </>
  )
}

// ─── Shape Renderer ──────────────────────────────────────────

function ShapeRenderer({ element }: { element: DesignElement }) {
  const baseStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: element.fill,
    border:
      element.strokeWidth > 0
        ? `${element.strokeWidth}px solid ${element.stroke}`
        : 'none',
    borderRadius:
      element.shapeVariant === 'ellipse' ? '50%' : element.borderRadius,
  }

  return <div style={baseStyle} />
}

// ─── Text Renderer ───────────────────────────────────────────

function TextRenderer({ element }: { element: DesignElement }) {
  return (
    <div
      className="w-full h-full flex items-start"
      style={{
        fontFamily: element.fontFamily,
        fontSize: `${element.fontSize}px`,
        fontWeight: element.fontWeight,
        lineHeight: element.lineHeight,
        letterSpacing: `${element.letterSpacing}px`,
        textAlign: element.textAlign,
        color: element.color,
        backgroundColor:
          element.fill !== 'transparent' ? element.fill : undefined,
        border:
          element.strokeWidth > 0
            ? `${element.strokeWidth}px solid ${element.stroke}`
            : 'none',
        borderRadius: element.borderRadius,
        padding: '4px',
        overflow: 'hidden',
        wordBreak: 'break-word',
        boxSizing: 'border-box',
      }}
      dangerouslySetInnerHTML={{ __html: element.content || 'Type here...' }}
    />
  )
}

// ─── Image Renderer ──────────────────────────────────────────

function ImageRenderer({ element }: { element: DesignElement }) {
  const updateElement = useDesignStore.useUpdateElement()

  const handleUploadClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        updateElement(element.id, { src: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }, [element.id, updateElement])

  if (!element.src) {
    return (
      <div
        className="w-full h-full flex flex-col gap-2 items-center justify-center border-2 border-dashed border-muted-foreground/20 text-muted-foreground/40 text-xs cursor-pointer hover:border-primary/40 hover:text-muted-foreground/60 transition-colors"
        style={{
          borderRadius: element.borderRadius,
          backgroundColor: 'rgba(0,0,0,0.02)',
        }}
        onClick={handleUploadClick}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        Click to upload
      </div>
    )
  }

  return (
    <img
      src={element.src}
      alt={element.name}
      className="w-full h-full"
      style={{
        borderRadius: element.borderRadius,
        objectFit: element.imageFit || 'cover',
        border:
          element.strokeWidth > 0
            ? `${element.strokeWidth}px solid ${element.stroke}`
            : 'none',
        boxSizing: 'border-box',
      }}
      draggable={false}
    />
  )
}

// ─── Reflection Renderer ─────────────────────────────────────

function ReflectionRenderer({ element }: { element: DesignElement }) {
  const reflectionH = element.height * (element.reflectionHeight / 100)

  return (
    <div
      style={{
        width: `${element.width}px`,
        height: `${reflectionH}px`,
        marginTop: `${element.reflectionDistance}px`,
        overflow: 'hidden',
        pointerEvents: 'none',
        position: 'relative',
      }}
    >
      {/* Flipped clone — bottom-aligned so the element's bottom edge
          appears at the top of the reflection after scaleY(-1) */}
      <div
        style={{
          width: `${element.width}px`,
          height: `${element.height}px`,
          position: 'absolute',
          bottom: 0,
          left: 0,
          transform: 'scaleY(-1)',
          opacity: element.reflectionOpacity,
        }}
      >
        {element.type === 'shape' && <ShapeRenderer element={element} />}
        {element.type === 'image' && element.src && (
          <img
            src={element.src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: element.imageFit || 'cover',
              borderRadius: element.borderRadius,
              display: 'block',
            }}
            draggable={false}
          />
        )}
        {element.type === 'text' && <TextRenderer element={element} />}
      </div>
      {/* Fade gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, transparent 0%, #e5e5e5 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
