import { useRef, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useDesignStore } from '@/stores/useDesignStore'
import { useToolStore } from '@/stores/useToolStore'
import { CanvasElement } from './CanvasElement'
import { FrameMesh } from './FrameMesh'
import { GridHelper } from './GridHelper'
import { useCanvasCreate } from '@/hooks/useCanvasCreate'

export function DesignCanvas() {
  const elements = useDesignStore.useElements()
  const frame = useDesignStore.useFrame()
  const gridEnabled = useDesignStore.useGridEnabled()
  const gridSize = useDesignStore.useGridSize()
  const deselectAll = useDesignStore.useDeselectAll()
  const activeTool = useToolStore.useActiveTool()
  const canvasBackground = useDesignStore.useCanvasBackground()

  const handlePointerMissed = () => {
    if (activeTool === 'select') {
      deselectAll()
    }
  }

  // Cursor based on active tool
  const cursorMap: Record<string, string> = {
    select: 'default',
    text: 'text',
    rectangle: 'crosshair',
    ellipse: 'crosshair',
    image: 'crosshair',
    hand: 'grab',
  }

  return (
    <Canvas
      orthographic
      flat
      onPointerMissed={handlePointerMissed}
      className="w-full h-full"
      style={{
        background: canvasBackground,
        cursor: cursorMap[activeTool] || 'default',
      }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <CameraController />

      <ambientLight intensity={1} />

      {/* ─── Frame (Artboard) ─── */}
      <FrameClick>
        <FrameMesh width={frame.width} height={frame.height} />
      </FrameClick>

      {/* ─── Grid ─── */}
      {gridEnabled && (
        <GridHelper
          width={frame.width}
          height={frame.height}
          gridSize={gridSize}
        />
      )}

      {/* ─── Design Elements ─── */}
      {elements.map((el, index) => (
        <CanvasElement key={el.id} element={el} order={index} />
      ))}
    </Canvas>
  )
}

// ─── Frame Click Handler ──────────────────────────────────────
// Handles clicking on the frame/artboard to create new elements

function FrameClick({ children }: { children: React.ReactNode }) {
  const handleCanvasClick = useCanvasCreate()

  return <group onClick={handleCanvasClick}>{children}</group>
}

// ─── Camera Controller ──────────────────────────────────────────
// Handles pan (middle mouse + drag, or space+drag)

function CameraController() {
  const { camera, gl } = useThree()
  const frame = useDesignStore.useFrame()
  const activeTool = useToolStore.useActiveTool()
  const setPanning = useToolStore.useSetPanning()

  const isDraggingRef = useRef(false)
  const lastPosRef = useRef({ x: 0, y: 0 })
  const spaceDownRef = useRef(false)

  // Set initial camera position
  useEffect(() => {
    camera.position.set(frame.width / 2, -frame.height / 2, 100)
    if ('zoom' in camera) {
      ;(camera as { zoom: number }).zoom = 0.75
      camera.updateProjectionMatrix()
    }
  }, [frame.width, frame.height, camera])

  // Space key for panning
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault()
        spaceDownRef.current = true
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDownRef.current = false
        isDraggingRef.current = false
        setPanning(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [setPanning])

  // Mouse drag for panning
  useEffect(() => {
    const canvas = gl.domElement

    const handleMouseDown = (e: MouseEvent) => {
      // Middle button or space+left click or hand tool
      if (e.button === 1 || spaceDownRef.current || activeTool === 'hand') {
        isDraggingRef.current = true
        lastPosRef.current = { x: e.clientX, y: e.clientY }
        setPanning(true)
        canvas.style.cursor = 'grabbing'
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return

      const dx = e.clientX - lastPosRef.current.x
      const dy = e.clientY - lastPosRef.current.y
      lastPosRef.current = { x: e.clientX, y: e.clientY }

      if ('zoom' in camera) {
        const orthoCamera = camera as { zoom: number }
        camera.position.x -= dx / orthoCamera.zoom
        camera.position.y += dy / orthoCamera.zoom
        camera.updateProjectionMatrix()
      }
    }

    const handleMouseUp = () => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        if (!spaceDownRef.current) {
          setPanning(false)
        }
        canvas.style.cursor = ''
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
    }
  }, [camera, gl, activeTool, setPanning])

  return null
}
