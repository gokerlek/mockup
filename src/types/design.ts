// ─── Element Types ───────────────────────────────────────────

export type ElementType = 'text' | 'shape' | 'image'

export type ShapeVariant = 'rectangle' | 'ellipse' | 'triangle' | 'line'

export type TextAlign = 'left' | 'center' | 'right'

export interface DesignElement {
  id: string
  type: ElementType
  name: string

  // ─── Position & Size ───
  x: number
  y: number
  width: number
  height: number

  // ─── 3D Rotation (radians) & Perspective ───
  rotateX: number
  rotateY: number
  rotateZ: number
  perspective: number // px

  // ─── Appearance ───
  opacity: number
  fill: string
  stroke: string
  strokeWidth: number
  borderRadius: number

  // ─── Text-specific ───
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: number
  lineHeight: number
  letterSpacing: number
  textAlign: TextAlign
  color: string

  // ─── Image-specific ───
  src: string
  imageFit: 'cover' | 'contain' | 'fill'

  // ─── Shape-specific ───
  shapeVariant: ShapeVariant

  // ─── Shadow ───
  shadowEnabled: boolean
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number

  // ─── Reflection ───
  reflectionEnabled: boolean
  reflectionOpacity: number
  reflectionDistance: number
  reflectionHeight: number // 0-100 percentage

  // ─── Layer Management ───
  zIndex: number
  visible: boolean
  locked: boolean
}

// ─── Factory Defaults ────────────────────────────────────────

export const DEFAULT_ELEMENT: Omit<DesignElement, 'id' | 'zIndex'> = {
  type: 'shape',
  name: 'Element',
  x: 100,
  y: 100,
  width: 200,
  height: 150,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  perspective: 0,
  opacity: 1,
  fill: '#4A90D9',
  stroke: 'transparent',
  strokeWidth: 0,
  borderRadius: 0,
  content: '',
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlign: 'left',
  color: '#1a1a1a',
  src: '',
  imageFit: 'cover',
  shapeVariant: 'rectangle',
  shadowEnabled: false,
  shadowColor: 'rgba(0,0,0,0.3)',
  shadowBlur: 20,
  shadowOffsetX: 0,
  shadowOffsetY: 10,
  reflectionEnabled: false,
  reflectionOpacity: 0.3,
  reflectionDistance: 4,
  reflectionHeight: 40,
  visible: true,
  locked: false,
}

export const DEFAULT_TEXT_ELEMENT: Partial<DesignElement> = {
  type: 'text',
  name: 'Text',
  width: 200,
  height: 40,
  fill: 'transparent',
  content: 'Type here...',
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 400,
  color: '#1a1a1a',
}

export const DEFAULT_SHAPE_ELEMENT: Partial<DesignElement> = {
  type: 'shape',
  name: 'Shape',
  width: 200,
  height: 150,
  fill: '#4A90D9',
  shapeVariant: 'rectangle',
}

// ─── Frame ───────────────────────────────────────────────────

export interface FramePreset {
  id: string
  name: string
  width: number // px
  height: number // px
  category: FrameCategory
}

export type FrameCategory = 'print' | 'social' | 'presentation' | 'custom'

// ─── Background ──────────────────────────────────────────────

export type GradientType = 'linear' | 'radial' | 'conic'

export interface FrameBackground {
  type: 'solid' | 'gradient' | 'image'
  // Solid
  color?: string
  // Gradient
  gradientType?: GradientType
  gradientColors?: string[]
  gradientStops?: number[] // 0 to 100
  gradientAngle?: number // deg
  // Image
  src?: string
  opacity?: number
}

// ─── Alignment ───────────────────────────────────────────────

export type AlignDirection =
  | 'left'
  | 'right'
  | 'top'
  | 'bottom'
  | 'centerH'
  | 'centerV'

export type DistributeAxis = 'horizontal' | 'vertical'
