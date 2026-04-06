import { useState } from 'react'
import { Box, Button, Container, Heading, Input, Stack, Field, Fieldset } from '@chakra-ui/react'
import { LabeledTextInput } from './components/LabeledTextInput'
import { YarnFields, type YarnState } from './components/YarnFields'
import { PatternEditor } from './components/PatternEditor'

function App() {
  const [projectName, setProjectName] = useState('')
  const [yarn, setYarn] = useState<YarnState>({ name: '', gauge: '', material: '', color: '' })
  const [startDate, setStartDate] = useState('')
  const [patternLines, setPatternLines] = useState<string[]>([])

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!window.confirm('Save this pattern?')) return
    await fetch('/api/savepattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectName,
        yarnName: yarn.name,
        yarnGauge: yarn.gauge,
        yarnMaterial: yarn.material,
        yarnColor: yarn.color,
        startDate,
        patternLines,
      }),
    });
  }

  return (
    <Container maxW="lg" py={10}>
      <Heading mb={8}>Hookbook</Heading>
      <Box as="form" onSubmit={handleSubmit}>
        <Fieldset.Root>
          <Stack gap={6}>
            <LabeledTextInput
              label="Project name"
              name="projectname"
              value={projectName}
              onChange={setProjectName}
              placeholder="Project name?"
              required
            />

            <YarnFields yarn={yarn} onChange={setYarn} />

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

            <PatternEditor lines={patternLines} onChange={setPatternLines} />

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
