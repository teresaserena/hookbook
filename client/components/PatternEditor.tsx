import { useMemo, useState } from 'react'
import { Badge, Button, Fieldset, Flex, Input, Stack, Text } from '@chakra-ui/react'
import { parseStitchCount } from '../utils/stitchCounter'

interface PatternEditorProps {
  lines: string[]
  onChange: (lines: string[]) => void
}

export function PatternEditor({ lines, onChange }: PatternEditorProps) {
  const [currentLine, setCurrentLine] = useState('')
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  const stitchCounts = useMemo(() =>
    lines.map((line, i) => {
      const prev = i > 0 ? parseStitchCount(lines[i - 1]) : undefined
      return parseStitchCount(line, prev)
    }),
    [lines]
  )

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
      <Fieldset.Legend fontWeight="bold" color="pink.500" fontSize="md" borderBottom="2px solid" borderColor="pink.200" pb={1}>
        Pattern
      </Fieldset.Legend>
      <Stack gap={3}>
        <Flex gap={2}>
          <Input
            type="text"
            id="pattern-new-line"
            placeholder="e.g. 2sc 8[sc inc sc] 2sc"
            value={currentLine}
            onChange={(e) => setCurrentLine(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLine(); } }}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.200"
          />
          <Button onClick={handleAddLine} flexShrink={0} colorPalette="pink" borderRadius="lg" _hover={{ transform: 'scale(1.05)', opacity: 0.9 }} transition="all 0.15s"> Add </Button>
        </Flex>

        {Array.from({ length: lines.length }, (_, k) => lines.length - 1 - k).map((i, displayIdx) => {
          const line = lines[i]
          const stitchCount = stitchCounts[i]
          return (
          <Flex
            key={i}
            gap={2}
            align="center"
            bg={displayIdx % 2 === 0 ? 'gray.100' : 'transparent'}
            px={2}
            py={1}
            borderRadius="lg"
          >
            <Text fontWeight="bold" flexShrink={0} w="2ch" textAlign="right" color="gray.400">{i + 1}.</Text>
            <Input
              type="text"
              id={`pattern-line-${i}`}
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
    </Fieldset.Root>
  )
}
