import { useState } from 'react'
import { Box, Button, Container, Flex, Heading, Input, Stack, Text, Field, Fieldset } from '@chakra-ui/react'
import { TextInput } from './components/TextInput'

function App() {
  const [projectName, setProjectName] = useState('')
  const [yarnName, setYarnName] = useState('')
  const [yarnGauge, setYarnGauge] = useState('')
  const [yarnMaterial, setYarnMaterial] = useState('')
  const [yarnColor, setYarnColor] = useState('')
  const [startDate, setStartDate] = useState('')
  const [patternLines, setPatternLines] = useState<string[]>([])
  const [currentLine, setCurrentLine] = useState('')
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  function handleAddLine() {
    if (!currentLine.trim()) return
    setPatternLines([...patternLines, currentLine.trim()])
    setCurrentLine('')
  }

  function handleUpdateLine(index: number, value: string) {
    const updated = [...patternLines]
    updated[index] = value
    setPatternLines(updated)
  }

  function handleRemoveLine(index: number) {
    if (!window.confirm(`Remove row ${index + 1}?`)) return
    setPatternLines(patternLines.filter((_, i) => i !== index))
    if (selectedLine === index) setSelectedLine(null)
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!window.confirm('Save this pattern?')) return
    await fetch('/api/savepattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectName, yarnName, yarnGauge, yarnMaterial, yarnColor, startDate, patternLines }),
    });
  }

  return (
    <Container maxW="lg" py={10}>
      <Heading mb={8}>Hookbook</Heading>
      <Box as="form" onSubmit={handleSubmit}>
        <Fieldset.Root>
          <Stack gap={6}>
            <Field.Root required>
              <Field.Label>Project name</Field.Label>
              <TextInput
                name="projectname"
                value={projectName}
                onChange={setProjectName}
                placeholder="Project name?"
                required
              />
            </Field.Root>

            <Fieldset.Root>
              <Fieldset.Legend>Yarn</Fieldset.Legend>
              <Stack gap={3}>
                <Field.Root>
                  <Field.Label>Brand</Field.Label>
                  <TextInput
                    name="yarnname"
                    value={yarnName}
                    onChange={setYarnName}
                    placeholder="Enter yarn brand or make something up"
                  />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Weight</Field.Label>
                  <TextInput
                    name="yarngauge"
                    value={yarnGauge}
                    onChange={setYarnGauge}
                    placeholder="e.g. worsted, DK, bulky"
                    required
                  />
                </Field.Root>
                <Field.Root>
                  <Field.Label>Material</Field.Label>
                  <TextInput
                    name="yarnmaterial"
                    value={yarnMaterial}
                    onChange={setYarnMaterial}
                    placeholder="e.g. acrylic, wool, cotton"
                  />
                </Field.Root>
                <Field.Root required>
                  <Field.Label>Color</Field.Label>
                  <TextInput
                    name="yarncolor"
                    value={yarnColor}
                    onChange={setYarnColor}
                    placeholder="Yarn color"
                    required
                  />
                </Field.Root>
              </Stack>
            </Fieldset.Root>

            <Field.Root required>
              <Field.Label>When did you start?</Field.Label>
              <Input
                type="date"
                name="startdate"
                id="startdate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </Field.Root>

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

                {patternLines.map((line, i) => (
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

            <Button type="submit" colorPalette="teal" size="lg" w="full">
              Save Pattern
            </Button>
          </Stack>
        </Fieldset.Root>
      </Box>
    </Container>
  )
}

export default App
