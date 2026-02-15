export type ToolType =
  | 'select'
  | 'text'
  | 'rectangle'
  | 'ellipse'
  | 'image'
  | 'hand'

export interface ToolDefinition {
  type: ToolType
  label: string
  shortcut: string
  icon: string // Tabler icon name
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  { type: 'select', label: 'Select', shortcut: 'V', icon: 'IconPointer' },
  { type: 'text', label: 'Text', shortcut: 'T', icon: 'IconTypography' },
  { type: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: 'IconSquare' },
  { type: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: 'IconCircle' },
  { type: 'image', label: 'Image', shortcut: 'I', icon: 'IconPhoto' },
  { type: 'hand', label: 'Hand', shortcut: 'H', icon: 'IconHandStop' },
]
