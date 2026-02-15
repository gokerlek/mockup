import { useCallback, useRef } from 'react'
import { useDesignStore } from '@/stores/useDesignStore'
import { useToolStore } from '@/stores/useToolStore'
import { DEFAULT_TEXT_ELEMENT, DEFAULT_SHAPE_ELEMENT } from '@/types/design'
import type { ThreeEvent } from '@react-three/fiber'

/**
 * Handles canvas click-to-create behavior based on the active tool.
 * Returns a pointer handler to attach to the R3F canvas background.
 */
export function useCanvasCreate() {
  const activeTool = useToolStore.useActiveTool()
  const setTool = useToolStore.useSetTool()
  const addElement = useDesignStore.useAddElement()
  const selectElement = useDesignStore.useSelectElement()
  const frame = useDesignStore.useFrame()

  // Track if a tool-create has been initiated to avoid double triggers
  const creatingRef = useRef(false)

  const handleCanvasClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      // Only handle creation tools
      if (activeTool === 'select' || activeTool === 'hand') return
      if (creatingRef.current) return

      creatingRef.current = true

      // Convert R3F point to screen coords
      const point = e.point
      const clickX = Math.round(Math.max(0, Math.min(point.x, frame.width)))
      const clickY = Math.round(Math.max(0, Math.min(-point.y, frame.height)))

      let newId: string | undefined

      switch (activeTool) {
        case 'text': {
          const w = 200
          const h = 40
          newId = addElement({
            ...DEFAULT_TEXT_ELEMENT,
            x: clickX - w / 2,
            y: clickY - h / 2,
          })
          break
        }
        case 'rectangle': {
          const w = 200
          const h = 150
          newId = addElement({
            ...DEFAULT_SHAPE_ELEMENT,
            name: 'Rectangle',
            shapeVariant: 'rectangle',
            x: clickX - w / 2,
            y: clickY - h / 2,
          })
          break
        }
        case 'ellipse': {
          const w = 150
          const h = 150
          newId = addElement({
            ...DEFAULT_SHAPE_ELEMENT,
            name: 'Ellipse',
            shapeVariant: 'ellipse',
            width: w,
            height: h,
            x: clickX - w / 2,
            y: clickY - h / 2,
          })
          break
        }
        case 'image': {
          // Open a file picker, then create the element with the chosen image
          const input = document.createElement('input')
          input.type = 'file'
          input.accept = 'image/*'
          input.onchange = () => {
            const file = input.files?.[0]
            if (!file) return

            const reader = new FileReader()
            reader.onload = () => {
              const dataUrl = reader.result as string

              // Determine image dimensions to set element size
              const img = new Image()
              img.onload = () => {
                const maxDim = 400
                let w = img.naturalWidth
                let h = img.naturalHeight
                if (w > maxDim || h > maxDim) {
                  const ratio = Math.min(maxDim / w, maxDim / h)
                  w = Math.round(w * ratio)
                  h = Math.round(h * ratio)
                }

                const id = addElement({
                  type: 'image',
                  name: file.name.replace(/\.[^.]+$/, ''),
                  width: w,
                  height: h,
                  x: clickX - w / 2,
                  y: clickY - h / 2,
                  src: dataUrl,
                })
                if (id) {
                  selectElement(id)
                  setTool('select')
                }
              }
              img.src = dataUrl
            }
            reader.readAsDataURL(file)
          }
          input.click()
          // Reset creating flag immediately since the async picker handles creation
          creatingRef.current = false
          return
        }
      }

      // Select newly created element and switch back to select tool
      if (newId) {
        selectElement(newId)
        setTool('select')
      }

      // Reset creating flag after a tick
      requestAnimationFrame(() => {
        creatingRef.current = false
      })
    },
    [activeTool, addElement, selectElement, setTool, frame],
  )

  return handleCanvasClick
}
