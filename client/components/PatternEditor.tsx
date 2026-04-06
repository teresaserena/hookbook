import { useState } from 'react'
import { Box, Button, Fieldset, Flex, Input, Stack, Text } from '@chakra-ui/react'

interface PatternEditorProps {
  lines: string[]
  onChange: (lines: string[]) => void
}

export function PatternEditor({ lines, onChange }: PatternEditorProps) {
  const [currentLine, setCurrentLine] = useState('')
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  function handleAddLine() {
    if (!currentLine.trim()) return
    onChange([...lines, currentLine.trim()])
    setCurrentLine('')
  }

  function handleUpdateLine(index: number, value: string) {
    const updated = [...lines]
    updated[index] = value
    onChange(updated)
  }

  function handleRemoveLine(index: number) {
    if (!window.confirm(`Remove row ${index + 1}?`)) return
    onChange(lines.filter((_, i) => i !== index))
    if (selectedLine === index) setSelectedLine(null)
  }

  return (
    <Fieldset.Root>
      <Fieldset.Legend>Pattern</Fieldset.Legend>
      <Stack gap={3}>
        <Flex gap={2}>
          <Input
            type="text"
            placeholder="e.g. 2sc 8[sc inc sc] 2sc"
            value={currentLine}
            onChange={(e) => setCurrentLine(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLine(); } }}
          />
          <Button onClick={handleAddLine} flexShrink={0}> Add </Button>
        </Flex>

        {lines.map((line, i) => (
          <Flex key={i} gap={2} align="center">
            <Text fontWeight="bold" flexShrink={0} w="2ch" textAlign="right">{i + 1}.</Text>
            <Input
              type="text"
              value={line}
              onChange={(e) => handleUpdateLine(i, e.target.value)}
              onFocus={() => setSelectedLine(i)}
              onBlur={() => setSelectedLine(null)}
              bg={selectedLine === i ? undefined : 'gray.100'}
              opacity={selectedLine === i ? 1 : 0.6}
              _dark={{ bg: selectedLine === i ? undefined : 'gray.700' }}
            />
            <Button
              size="sm"
              colorPalette="red"
              variant="outline"
              flexShrink={0}
              onClick={() => handleRemoveLine(i)}
            >
              X
            </Button>
          </Flex>
        ))}
      </Stack>
    </Fieldset.Root>
  )
}
