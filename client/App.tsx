import { useEffect, useState } from 'react'
import { Box, Button, Container, Heading, Input, Stack, Field, Fieldset, Flex, NativeSelect, Alert, CloseButton } from '@chakra-ui/react'
import { LabeledTextInput } from './components/LabeledTextInput'
import { YarnFields, type YarnState } from './components/YarnFields'
import { PatternEditor } from './components/PatternEditor'
import { validatePattern, type PatternData } from './utils/validatePattern'

function isFormDirty(projectName: string, yarn: YarnState, startDate: string, patternLines: string[]): boolean {
  return (
    projectName !== '' ||
    yarn.name !== '' ||
    yarn.gauge !== '' ||
    yarn.material !== '' ||
    yarn.color !== '' ||
    startDate !== '' ||
    patternLines.length > 0
  )
}

function populateForm(
  data: PatternData,
  setProjectName: (v: string) => void,
  setYarn: (v: YarnState) => void,
  setStartDate: (v: string) => void,
  setPatternLines: (v: string[]) => void
) {
  setProjectName(data.projectName)
  setYarn({
    name: data.yarnName,
    gauge: data.yarnGauge,
    material: data.yarnMaterial,
    color: data.yarnColor,
  })
  setStartDate(data.startDate)
  setPatternLines(data.patternLines)
}

function App() {
  const [projectName, setProjectName] = useState('')
  const [yarn, setYarn] = useState<YarnState>({ name: '', gauge: '', material: '', color: '' })
  const [startDate, setStartDate] = useState('')
  const [patternLines, setPatternLines] = useState<string[]>([])

  const [savedPatterns, setSavedPatterns] = useState<string[]>([])
  const [selectedPattern, setSelectedPattern] = useState('')
  const [loadErrors, setLoadErrors] = useState<string[] | null>(null)
  const [sourceFile, setSourceFile] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/patterns')
      .then((res) => res.json())
      .then((files: string[]) => setSavedPatterns(files))
      .catch(() => setSavedPatterns([]))
  }, [])

  function guardDirtyForm(): boolean {
    if (isFormDirty(projectName, yarn, startDate, patternLines)) {
      return window.confirm('You have unsaved changes. Load anyway?')
    }
    return true
  }

  function handleValidationResult(input: unknown) {
    const result = validatePattern(input)
    if (!result.ok) {
      setLoadErrors(result.errors)
      return
    }
    setLoadErrors(null)
    setSourceFile(null)
    populateForm(result.data, setProjectName, setYarn, setStartDate, setPatternLines)
  }

  async function handleLoadFromServer() {
    if (!selectedPattern) return
    if (!guardDirtyForm()) return

    try {
      const res = await fetch(`/api/patterns/${encodeURIComponent(selectedPattern)}`)
      if (!res.ok) {
        const body = await res.json()
        setLoadErrors([body.error ?? 'Failed to load pattern from server.'])
        return
      }
      const data = await res.json()
      const result = validatePattern(data)
      if (!result.ok) {
        setLoadErrors(result.errors)
        return
      }
      setLoadErrors(null)
      setSourceFile(selectedPattern)
      populateForm(result.data, setProjectName, setYarn, setStartDate, setPatternLines)
    } catch {
      setLoadErrors(['Failed to fetch pattern from server.'])
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!guardDirtyForm()) {
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string)
        handleValidationResult(parsed)
      } catch {
        setLoadErrors(['File is not valid JSON.'])
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

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
        ...(sourceFile ? { sourceFile } : {}),
      }),
    });

    // Refresh the saved patterns list after saving
    fetch('/api/patterns')
      .then((res) => res.json())
      .then((files: string[]) => setSavedPatterns(files))
      .catch(() => {})
  }

  return (
    <Container maxW="lg" py={10}>
      <Heading mb={8}>Hookbook</Heading>

      {loadErrors && (
        <Alert.Root status="error" mb={6}>
          <Alert.Indicator />
          <Box flex="1">
            <Alert.Title>Failed to load pattern</Alert.Title>
            <Alert.Description>
              {loadErrors.map((err, i) => (
                <Box key={i}>{err}</Box>
              ))}
            </Alert.Description>
          </Box>
          <CloseButton onClick={() => setLoadErrors(null)} position="relative" />
        </Alert.Root>
      )}

      <Fieldset.Root mb={8}>
        <Fieldset.Legend>Load Pattern</Fieldset.Legend>
        <Stack gap={3}>
          <Flex gap={2} align="end">
            <Box flex="1">
              <Field.Root>
                <Field.Label>Saved patterns</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    value={selectedPattern}
                    onChange={(e) => setSelectedPattern(e.target.value)}
                  >
                    <option value="">Select a pattern...</option>
                    {savedPatterns.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>
            </Box>
            <Button onClick={handleLoadFromServer} disabled={!selectedPattern} flexShrink={0}>
              Load from Server
            </Button>
          </Flex>
          <Field.Root>
            <Field.Label>Or upload a file</Field.Label>
            <Input type="file" accept=".json" onChange={handleFileUpload} />
          </Field.Root>
        </Stack>
      </Fieldset.Root>

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
