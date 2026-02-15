import { createFileRoute } from '@tanstack/react-router'
import { EditorLayout } from '@/components/editor/EditorLayout'

export const Route = createFileRoute('/editor')({
  component: EditorPage,
})

function EditorPage() {
  return <EditorLayout />
}
