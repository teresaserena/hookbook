import { useRef } from 'react'
import { Button, Fieldset, Stack } from '@chakra-ui/react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SectionBlock } from './SectionBlock'
import { makeSection, type Section } from '../utils/sections'

interface PatternEditorProps {
  sections: Section[]
  onChange: (sections: Section[]) => void
}

function SortableSection(props: {
  section: Section
  canDelete: boolean
  onLabelChange: (label: string) => void
  onLinesChange: (lines: string[]) => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.section.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <SectionBlock
        section={props.section}
        canDelete={props.canDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
        onLabelChange={props.onLabelChange}
        onLinesChange={props.onLinesChange}
        onDelete={props.onDelete}
      />
    </div>
  )
}

export function PatternEditor({ sections, onChange }: PatternEditorProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const editorRef = useRef<HTMLDivElement>(null)

  function updateSection(index: number, patch: Partial<Section>) {
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  function deleteSection(index: number) {
    onChange(sections.filter((_, i) => i !== index))
  }

  function handleAddSection() {
    const onlyOne = sections.length === 1
    const first = sections[0]
    if (onlyOne && first && first.label === '' && first.lines.length > 0) {
      const labelInput = editorRef.current?.querySelector<HTMLInputElement>(
        `#section-label-${first.id}`
      )
      labelInput?.focus()
      return
    }
    onChange([...sections, makeSection()])
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    onChange(arrayMove(sections, oldIndex, newIndex))
  }

  return (
    <Fieldset.Root>
      <Fieldset.Legend
        fontWeight="bold"
        color="pink.500"
        fontSize="md"
        borderBottom="2px solid"
        borderColor="pink.200"
        pb={1}
      >
        Pattern
      </Fieldset.Legend>
      <div ref={editorRef}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <Stack gap={4}>
              {sections.map((section, i) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  canDelete={sections.length > 1}
                  onLabelChange={(label) => updateSection(i, { label })}
                  onLinesChange={(lines) => updateSection(i, { lines })}
                  onDelete={() => deleteSection(i)}
                />
              ))}
            </Stack>
          </SortableContext>
        </DndContext>
        <Button
          mt={4}
          variant="outline"
          colorPalette="purple"
          borderRadius="lg"
          onClick={handleAddSection}
        >
          + Add Section
        </Button>
      </div>
    </Fieldset.Root>
  )
}
