import { useMemo, useState } from 'react'
import { Badge, Box, Button, Flex, IconButton, Input, Stack, Text } from '@chakra-ui/react'
import { parseStitchCount } from '../utils/stitchCounter'
import type { Section } from '../utils/sections'

interface SectionBlockProps {
  section: Section
  canDelete: boolean
  dragHandleProps?: Record<string, unknown>
  onLabelChange: (label: string) => void
  onLinesChange: (lines: string[]) => void
  onDelete: () => void
}

export function SectionBlock({
  section,
  canDelete,
  dragHandleProps,
  onLabelChange,
  onLinesChange,
  onDelete,
}: SectionBlockProps) {
  const [currentLine, setCurrentLine] = useState('')
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  const stitchCounts = useMemo(
    () =>
      section.lines.map((line, i) => {
        const prev = i > 0 ? parseStitchCount(section.lines[i - 1]!) : undefined
        return parseStitchCount(line, prev)
      }),
    [section.lines]
  )

  function handleAddLine() {
    if (!currentLine.trim()) return
    onLinesChange([...section.lines, currentLine.trim()])
    setCurrentLine('')
  }

  function handleUpdateLine(index: number, value: string) {
    const updated = [...section.lines]
    updated[index] = value
    onLinesChange(updated)
  }

  function handleRemoveLine(index: number) {
    if (!window.confirm(`Remove row ${index + 1}?`)) return
    onLinesChange(section.lines.filter((_, i) => i !== index))
    if (selectedLine === index) setSelectedLine(null)
  }

  function handleDeleteSection() {
    const displayLabel = section.label || 'unlabeled section'
    if (!window.confirm(`Delete section "${displayLabel}" and all its rows?`)) return
    onDelete()
  }

  return (
    <Box
      borderWidth="1px"
      borderColor="purple.100"
      borderRadius="xl"
      bg="purple.50"
      p={3}
    >
      <Flex align="center" gap={2} mb={3}>
        <Box
          {...(dragHandleProps ?? {})}
          cursor="grab"
          px={1}
          color="gray.400"
          aria-label="Drag section"
          userSelect="none"
        >
          ⋮⋮
        </Box>
        <Input
          id={`section-label-${section.id}`}
          value={section.label}
          placeholder="unlabeled section"
          onChange={(e) => onLabelChange(e.target.value)}
          borderRadius="lg"
          bg="white"
          fontWeight="bold"
          color="purple.600"
        />
        <IconButton
          aria-label="Delete section"
          size="sm"
          colorPalette="red"
          variant="ghost"
          disabled={!canDelete}
          onClick={handleDeleteSection}
        >
          X
        </IconButton>
      </Flex>

      <Stack gap={3}>
        <Flex gap={2}>
          <Input
            type="text"
            id={`pattern-new-line-${section.id}`}
            placeholder="e.g. 2sc 8[sc inc sc] 2sc"
            value={currentLine}
            onChange={(e) => setCurrentLine(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddLine()
              }
            }}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.200"
            bg="white"
          />
          <Button
            onClick={handleAddLine}
            flexShrink={0}
            colorPalette="pink"
            borderRadius="lg"
            _hover={{ transform: 'scale(1.05)', opacity: 0.9 }}
            transition="all 0.15s"
          >
            Add
          </Button>
        </Flex>

        {section.lines.map((line, i) => {
          const stitchCount = stitchCounts[i]!
          return (
            <Flex
              key={i}
              gap={2}
              align="center"
              bg={i % 2 === 0 ? 'gray.100' : 'transparent'}
              px={2}
              py={1}
              borderRadius="lg"
            >
              <Text fontWeight="bold" flexShrink={0} w="2ch" textAlign="right" color="gray.400">
                {i + 1}.
              </Text>
              <Input
                type="text"
                id={`pattern-line-${section.id}-${i}`}
                value={line}
                onChange={(e) => handleUpdateLine(i, e.target.value)}
                onFocus={() => setSelectedLine(i)}
                onBlur={() => setSelectedLine(null)}
                borderRadius="lg"
                bg={selectedLine === i ? 'white' : 'transparent'}
                color={selectedLine === i ? 'gray.900' : 'inherit'}
                borderWidth="1px"
                borderColor={selectedLine === i ? 'pink.300' : 'gray.200'}
                _hover={{ borderColor: 'pink.200' }}
              />
              {stitchCount > 0 && (
                <Badge colorPalette="pink" variant="subtle" borderRadius="full" flexShrink={0}>
                  {stitchCount}
                </Badge>
              )}
              <Button
                size="sm"
                colorPalette="red"
                variant="ghost"
                flexShrink={0}
                onClick={() => handleRemoveLine(i)}
                borderRadius="full"
                _hover={{ bg: 'red.100', transform: 'scale(1.1)' }}
                transition="all 0.15s"
              >
                X
              </Button>
            </Flex>
          )
        })}
      </Stack>
    </Box>
  )
}
