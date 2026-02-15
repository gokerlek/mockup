import { useCallback } from 'react'
import { useDesignStore } from '@/stores/useDesignStore'
import type { DesignElement, FrameBackground } from '@/types/design'

/**
 * Export the frame area (artboard) as a PNG at native resolution.
 *
 * Renders frame background + all visible elements onto an offscreen 2D canvas
 * at the frame's original pixel dimensions (e.g. 1080×1080 for Instagram Post).
 */
export function useExportFrame() {
  const frame = useDesignStore.useFrame()
  const elements = useDesignStore.useElements()
  const frameBackground = useDesignStore.useFrameBackground()

  const exportAsPng = useCallback(async () => {
    console.log('[EXPORT v3] Starting export — native resolution, no scaling')
    const w = frame.width
    const h = frame.height

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    // 1. Draw background
    await drawBackground(ctx, w, h, frameBackground)

    // 2. Draw each visible element in order (lower index = further back)
    const sortedElements = [...elements].filter((el) => el.visible)
    console.log(
      '[EXPORT v3] Elements:',
      sortedElements.length,
      sortedElements.map((e) => `${e.name}(${e.type})`),
    )

    for (const el of sortedElements) {
      ctx.save()
      ctx.globalAlpha = el.opacity

      // Shadow
      if (el.shadowEnabled) {
        ctx.shadowColor = el.shadowColor
        ctx.shadowBlur = el.shadowBlur
        ctx.shadowOffsetX = el.shadowOffsetX
        ctx.shadowOffsetY = el.shadowOffsetY
      }

      // Rotation around element center
      if (el.rotateZ !== 0) {
        const cx = el.x + el.width / 2
        const cy = el.y + el.height / 2
        ctx.translate(cx, cy)
        ctx.rotate(el.rotateZ)
        ctx.translate(-cx, -cy)
      }

      switch (el.type) {
        case 'shape':
          drawShape(ctx, el)
          break
        case 'text':
          drawText(ctx, el)
          break
        case 'image':
          await drawImage(ctx, el)
          break
      }

      ctx.restore()
    }

    // 3. Show preview overlay (temp debug)
    const dataUrl = canvas.toDataURL('image/png')
    const overlay = document.createElement('div')
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-direction:column;gap:12px;'
    overlay.onclick = () => overlay.remove()

    const img = document.createElement('img')
    img.src = dataUrl
    img.style.cssText = 'max-width:80vw;max-height:70vh;border:2px solid white;'
    overlay.appendChild(img)

    const info = document.createElement('div')
    info.style.cssText = 'color:white;font-family:monospace;font-size:14px;'
    info.textContent = `[v3] ${w}×${h} | Elements: ${sortedElements.length} | Click to close & download`
    overlay.appendChild(info)

    document.body.appendChild(overlay)

    // Also download
    const link = document.createElement('a')
    link.download = `${frame.name.replace(/\s+/g, '-').toLowerCase()}-${w}x${h}.png`
    link.href = dataUrl
    link.click()
  }, [frame, elements, frameBackground])

  return exportAsPng
}

// ─── Background ──────────────────────────────────────────────

async function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: FrameBackground,
) {
  if (bg.type === 'solid') {
    ctx.fillStyle = bg.color || '#ffffff'
    ctx.fillRect(0, 0, w, h)
    return
  }

  if (bg.type === 'gradient') {
    const colors = bg.gradientColors ?? ['#ffffff', '#000000']

    let gradient: CanvasGradient

    if (bg.gradientType === 'radial') {
      gradient = ctx.createRadialGradient(
        w / 2,
        h / 2,
        0,
        w / 2,
        h / 2,
        Math.max(w, h) / 2,
      )
    } else if (bg.gradientType === 'conic') {
      gradient = ctx.createConicGradient(0, w / 2, h / 2)
    } else {
      // linear
      const angle = ((bg.gradientAngle ?? 180) * Math.PI) / 180
      const dx = Math.cos(angle)
      const dy = Math.sin(angle)
      gradient = ctx.createLinearGradient(
        w / 2 - (dx * w) / 2,
        h / 2 - (dy * h) / 2,
        w / 2 + (dx * w) / 2,
        h / 2 + (dy * h) / 2,
      )
    }

    colors.forEach((c, i) => gradient.addColorStop(i / (colors.length - 1), c))
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
    return
  }

  if (bg.type === 'image' && bg.src) {
    const img = await loadImage(bg.src)
    ctx.globalAlpha = bg.opacity ?? 1
    ctx.drawImage(img, 0, 0, w, h)
    ctx.globalAlpha = 1
    return
  }

  // Fallback
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
}

// ─── Shapes ──────────────────────────────────────────────────

function drawShape(ctx: CanvasRenderingContext2D, el: DesignElement) {
  const {
    x,
    y,
    width: ew,
    height: eh,
    fill,
    stroke,
    strokeWidth,
    borderRadius,
    shapeVariant,
  } = el

  ctx.fillStyle = fill
  if (strokeWidth > 0) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth
  }

  if (shapeVariant === 'ellipse') {
    ctx.beginPath()
    ctx.ellipse(x + ew / 2, y + eh / 2, ew / 2, eh / 2, 0, 0, Math.PI * 2)
    if (fill !== 'transparent') ctx.fill()
    if (strokeWidth > 0) ctx.stroke()
  } else if (shapeVariant === 'triangle') {
    ctx.beginPath()
    ctx.moveTo(x + ew / 2, y)
    ctx.lineTo(x + ew, y + eh)
    ctx.lineTo(x, y + eh)
    ctx.closePath()
    if (fill !== 'transparent') ctx.fill()
    if (strokeWidth > 0) ctx.stroke()
  } else if (shapeVariant === 'line') {
    ctx.beginPath()
    ctx.moveTo(x, y + eh / 2)
    ctx.lineTo(x + ew, y + eh / 2)
    ctx.strokeStyle = stroke !== 'transparent' ? stroke : fill
    ctx.lineWidth = strokeWidth || 2
    ctx.stroke()
  } else {
    // rectangle
    if (borderRadius > 0) {
      roundRect(ctx, x, y, ew, eh, borderRadius)
      if (fill !== 'transparent') ctx.fill()
      if (strokeWidth > 0) ctx.stroke()
    } else {
      if (fill !== 'transparent') ctx.fillRect(x, y, ew, eh)
      if (strokeWidth > 0) ctx.strokeRect(x, y, ew, eh)
    }
  }
}

// ─── Text ────────────────────────────────────────────────────

function drawText(ctx: CanvasRenderingContext2D, el: DesignElement) {
  const { x, y, width: ew, height: eh } = el

  // Draw background fill if not transparent
  if (el.fill !== 'transparent') {
    ctx.fillStyle = el.fill
    if (el.borderRadius > 0) {
      roundRect(ctx, x, y, ew, eh, el.borderRadius)
      ctx.fill()
    } else {
      ctx.fillRect(x, y, ew, eh)
    }
  }

  // Strip HTML tags for plain text rendering
  const plainText = (el.content || '').replace(/<[^>]*>/g, '')
  if (!plainText.trim()) return

  ctx.fillStyle = el.color
  ctx.font = `${el.fontWeight} ${el.fontSize}px ${el.fontFamily}`
  ctx.textBaseline = 'top'

  if (el.textAlign === 'center') {
    ctx.textAlign = 'center'
  } else if (el.textAlign === 'right') {
    ctx.textAlign = 'right'
  } else {
    ctx.textAlign = 'left'
  }

  // Word wrap
  const padding = 4
  const maxWidth = ew - padding * 2
  const lineHeight = el.fontSize * el.lineHeight
  const lines = wrapText(ctx, plainText, maxWidth)

  let textX: number
  if (el.textAlign === 'center') {
    textX = x + ew / 2
  } else if (el.textAlign === 'right') {
    textX = x + ew - padding
  } else {
    textX = x + padding
  }

  lines.forEach((line, i) => {
    const ty = y + padding + i * lineHeight
    if (ty + lineHeight <= y + eh + lineHeight) {
      ctx.fillText(line, textX, ty)
    }
  })
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const width = ctx.measureText(testLine).width
    if (width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines
}

// ─── Images ──────────────────────────────────────────────────

async function drawImage(ctx: CanvasRenderingContext2D, el: DesignElement) {
  if (!el.src) return

  try {
    const img = await loadImage(el.src)

    // Apply border radius clipping
    if (el.borderRadius > 0) {
      ctx.save()
      roundRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius)
      ctx.clip()
    }

    if (el.imageFit === 'fill') {
      ctx.drawImage(img, el.x, el.y, el.width, el.height)
    } else if (el.imageFit === 'contain') {
      const ratio = Math.min(el.width / img.width, el.height / img.height)
      const rw = img.width * ratio
      const rh = img.height * ratio
      ctx.drawImage(
        img,
        el.x + (el.width - rw) / 2,
        el.y + (el.height - rh) / 2,
        rw,
        rh,
      )
    } else {
      // cover
      const ratio = Math.max(el.width / img.width, el.height / img.height)
      const rw = img.width * ratio
      const rh = img.height * ratio
      ctx.drawImage(
        img,
        el.x + (el.width - rw) / 2,
        el.y + (el.height - rh) / 2,
        rw,
        rh,
      )
    }

    if (el.borderRadius > 0) {
      ctx.restore()
    }

    // Draw stroke if any
    if (el.strokeWidth > 0) {
      ctx.strokeStyle = el.stroke
      ctx.lineWidth = el.strokeWidth
      if (el.borderRadius > 0) {
        roundRect(ctx, el.x, el.y, el.width, el.height, el.borderRadius)
        ctx.stroke()
      } else {
        ctx.strokeRect(el.x, el.y, el.width, el.height)
      }
    }
  } catch {
    // Image failed to load — draw placeholder
    ctx.fillStyle = '#eee'
    ctx.fillRect(el.x, el.y, el.width, el.height)
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// ─── Helpers ─────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.arcTo(x + w, y, x + w, y + radius, radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius)
  ctx.lineTo(x + radius, y + h)
  ctx.arcTo(x, y + h, x, y + h - radius, radius)
  ctx.lineTo(x, y + radius)
  ctx.arcTo(x, y, x + radius, y, radius)
  ctx.closePath()
}
