import { useMemo, useEffect, useState } from 'react'
import * as THREE from 'three'
import { useDesignStore } from '@/stores/useDesignStore'

interface FrameMeshProps {
  width: number
  height: number
}

/**
 * Renders the artboard (frame) background using a pure Three.js mesh.
 */
export function FrameMesh({ width, height }: FrameMeshProps) {
  const frameBackground = useDesignStore.useFrameBackground()
  const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null)

  // Plane geometry (same size as the artboard)
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(width, height)
  }, [width, height])

  // Handle Image loading
  useEffect(() => {
    if (frameBackground.type === 'image' && frameBackground.src) {
      const loader = new THREE.TextureLoader()
      loader.load(frameBackground.src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        setImageTexture(tex)
      })
    } else {
      setImageTexture((prev) => {
        if (prev) prev.dispose()
        return null
      })
    }
  }, [frameBackground.type, frameBackground.src])

  // Helper to create a checkerboard texture for image placeholders
  const placeholderTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#f0f0f0'
    ctx.fillRect(0, 0, 32, 32)
    ctx.fillStyle = '#e0e0e0'
    ctx.fillRect(0, 0, 16, 16)
    ctx.fillRect(16, 16, 16, 16)
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(20, 20)
    return tex
  }, [])

  // Calculate the material props based on frameBackground
  const materialProps = useMemo(() => {
    const {
      type,
      color,
      gradientType,
      gradientColors,
      gradientAngle,
      opacity,
    } = frameBackground

    // ── Solid ─────────────────────────────────────────────
    if (type === 'solid') {
      return {
        color: color || '#ffffff',
        map: null,
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1,
      }
    }

    // ── Gradient ──────────────────────────────────────────
    if (type === 'gradient') {
      const canvas = document.createElement('canvas')
      const res = 1024
      canvas.width = res
      canvas.height = res
      const ctx = canvas.getContext('2d')!
      const colors = gradientColors ?? ['#ffffff', '#000000']

      if (gradientType === 'radial') {
        const g = ctx.createRadialGradient(
          res / 2,
          res / 2,
          0,
          res / 2,
          res / 2,
          res / 2,
        )
        colors.forEach((c: string, i: number) =>
          g.addColorStop(i / (colors.length - 1), c),
        )
        ctx.fillStyle = g
      } else if (gradientType === 'conic') {
        const cx2 = res / 2
        const cy2 = res / 2
        const totalSteps = 360
        for (let s = 0; s < totalSteps; s++) {
          const t = s / totalSteps
          const colorIdx = t * (colors.length - 1)
          const lower = Math.floor(colorIdx)
          const upper = Math.min(lower + 1, colors.length - 1)
          const mix = colorIdx - lower
          const c = lerpColor(colors[lower], colors[upper], mix)
          const startAngle = (s * Math.PI * 2) / totalSteps - Math.PI / 2
          const endAngle = ((s + 1) * Math.PI * 2) / totalSteps - Math.PI / 2
          ctx.beginPath()
          ctx.moveTo(cx2, cy2)
          ctx.arc(cx2, cy2, res, startAngle, endAngle)
          ctx.fillStyle = c
          ctx.fill()
        }
      } else {
        const rad = ((gradientAngle ?? 180) * Math.PI) / 180
        const x0 = res / 2 - (Math.cos(rad) * res) / 2
        const y0 = res / 2 - (Math.sin(rad) * res) / 2
        const x1 = res / 2 + (Math.cos(rad) * res) / 2
        const y1 = res / 2 + (Math.sin(rad) * res) / 2
        const g = ctx.createLinearGradient(x0, y0, x1, y1)
        colors.forEach((c: string, i: number) =>
          g.addColorStop(i / (colors.length - 1), c),
        )
        ctx.fillStyle = g
      }

      if (gradientType !== 'conic') {
        ctx.fillRect(0, 0, res, res)
      }

      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.needsUpdate = true

      return {
        map: tex,
        color: '#ffffff',
        side: THREE.DoubleSide,
        transparent: false,
        opacity: 1,
      }
    }

    // ── Image ─────────────────────────────────────────────
    if (type === 'image') {
      const finalMap = imageTexture || placeholderTexture
      return {
        map: finalMap,
        color: '#ffffff',
        side: THREE.DoubleSide,
        transparent: (opacity ?? 1) < 1 || !imageTexture,
        opacity: opacity ?? 1,
      }
    }

    // Fallback: white
    return {
      color: '#ffffff',
      map: null,
      side: THREE.DoubleSide,
      transparent: false,
      opacity: 1,
    }
  }, [frameBackground, imageTexture, placeholderTexture])

  // Cleanup effect
  useEffect(() => {
    const currentMap = materialProps.map
    return () => {
      // Only dispose if it's a generated texture (not imageTexture, not placeholder)
      if (
        currentMap &&
        currentMap !== imageTexture &&
        currentMap !== placeholderTexture
      ) {
        currentMap.dispose()
      }
    }
  }, [materialProps.map, imageTexture, placeholderTexture])

  // Cleanup static placeholder on unmount
  useEffect(() => {
    return () => placeholderTexture.dispose()
  }, [placeholderTexture])

  return (
    <group position={[width / 2, -height / 2, 0]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial {...materialProps} />
      </mesh>
    </group>
  )
}

function hexToRgb(hex: string) {
  hex = hex.replace('#', '')
  if (hex.length === 3)
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  return {
    r: parseInt(hex.substring(0, 2), 16),
    g: parseInt(hex.substring(2, 4), 16),
    b: parseInt(hex.substring(4, 6), 16),
  }
}

function lerpColor(a: string, b: string, t: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  const r = Math.round(ca.r + (cb.r - ca.r) * t)
  const g = Math.round(ca.g + (cb.g - ca.g) * t)
  const bl = Math.round(ca.b + (cb.b - ca.b) * t)
  return `rgb(${r},${g},${bl})`
}
