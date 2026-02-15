import { useCallback, useRef, useEffect, useState } from 'react'
import { useDesignStore } from '@/stores/useDesignStore'
import { Button } from '@/components/ui/button'
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconStrikethrough,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconList,
  IconListNumbers,
} from '@tabler/icons-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'

interface RichTextEditorProps {
  elementId: string
  initialContent: string
  style?: React.CSSProperties
  onBlur?: () => void
}

export function RichTextEditor({
  elementId,
  initialContent,
  style,
  onBlur,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const updateElement = useDesignStore.useUpdateElement()
  const [showToolbar] = useState(true)

  // Focus on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus()
      // Place cursor at the end
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [])

  const execCommand = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
  }, [])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      updateElement(elementId, { content: editorRef.current.innerHTML })
    }
  }, [elementId, updateElement])

  const handleBlur = useCallback(() => {
    if (editorRef.current) {
      updateElement(elementId, { content: editorRef.current.innerHTML })
    }
    onBlur?.()
  }, [elementId, updateElement, onBlur])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Prevent propagation so keyboard shortcuts don't fire
      e.stopPropagation()

      // Bold
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        execCommand('bold')
      }
      // Italic
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault()
        execCommand('italic')
      }
      // Underline
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault()
        execCommand('underline')
      }
    },
    [execCommand],
  )

  return (
    <div
      className="rich-text-editor flex flex-col"
      style={{ width: '100%', height: '100%' }}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {/* ─── Mini Toolbar ─── */}
      {showToolbar && (
        <div
          className="flex items-center gap-0.5 px-1.5 py-0.5 bg-card/95 backdrop-blur-sm rounded-t-md border border-border shadow-lg"
          style={{ position: 'absolute', top: -36, left: 0, zIndex: 9999 }}
          onMouseDown={(e) => e.preventDefault()} // prevent blur
        >
          <FormatButton
            icon={<IconBold size={13} />}
            label="Bold (⌘B)"
            onClick={() => execCommand('bold')}
          />
          <FormatButton
            icon={<IconItalic size={13} />}
            label="Italic (⌘I)"
            onClick={() => execCommand('italic')}
          />
          <FormatButton
            icon={<IconUnderline size={13} />}
            label="Underline (⌘U)"
            onClick={() => execCommand('underline')}
          />
          <FormatButton
            icon={<IconStrikethrough size={13} />}
            label="Strikethrough"
            onClick={() => execCommand('strikethrough')}
          />

          <Separator orientation="vertical" className="mx-0.5 h-4" />

          <FormatButton
            icon={<IconAlignLeft size={13} />}
            label="Align Left"
            onClick={() => execCommand('justifyLeft')}
          />
          <FormatButton
            icon={<IconAlignCenter size={13} />}
            label="Align Center"
            onClick={() => execCommand('justifyCenter')}
          />
          <FormatButton
            icon={<IconAlignRight size={13} />}
            label="Align Right"
            onClick={() => execCommand('justifyRight')}
          />

          <Separator orientation="vertical" className="mx-0.5 h-4" />

          <FormatButton
            icon={<IconList size={13} />}
            label="Bullet List"
            onClick={() => execCommand('insertUnorderedList')}
          />
          <FormatButton
            icon={<IconListNumbers size={13} />}
            label="Numbered List"
            onClick={() => execCommand('insertOrderedList')}
          />
        </div>
      )}

      {/* ─── Editable Content ─── */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="outline-none w-full h-full overflow-auto cursor-text"
        style={{
          ...style,
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
        }}
        dangerouslySetInnerHTML={{ __html: initialContent }}
        onInput={handleInput}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}

// ─── Format Button ──────────────────────────────────────────

function FormatButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onClick}
            onMouseDown={(e) => e.preventDefault()}
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  )
}
