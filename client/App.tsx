import { useEffect, useState } from 'react'
import React from 'react'
import { Box, Button, Container, Heading, Input, Stack, Field, Fieldset, Flex, Alert, CloseButton, Text } from '@chakra-ui/react'
import { LabeledTextInput } from './components/LabeledTextInput'
import { YarnFields, type YarnState } from './components/YarnFields'
import { PatternEditor } from './components/PatternEditor'
import { validatePattern, type PatternData } from './utils/validatePattern'
import { PatternCard, type PatternCardData } from './components/PatternCard'
import { ReferenceImages } from './components/ReferenceImages'

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

  const [savedPatterns, setSavedPatterns] = useState<PatternCardData[]>([])
  const [patternId, setPatternId] = useState<string | null>(null)
  const [loadErrors, setLoadErrors] = useState<string[] | null>(null)

  useEffect(() => {
    fetchPatterns()
  }, [])

  function fetchPatterns() {
    fetch('/api/patterns')
      .then((res) => res.json())
      .then((data: PatternCardData[]) => setSavedPatterns(data))
      .catch(() => setSavedPatterns([]))
  }

  function guardDirtyForm(): boolean {
    if (isFormDirty(projectName, yarn, startDate, patternLines)) {
      return window.confirm('You have unsaved changes. Load anyway?')
    }
    return true
  }

  function handleLoadPattern(pattern: PatternCardData) {
    if (!guardDirtyForm()) return

    fetch(`/api/patterns/${pattern.patternId}`)
      .then((res) => res.json())
      .then((data: unknown) => {
        const result = validatePattern(data)
        if (!result.ok) {
          setLoadErrors(result.errors)
          return
        }
        setLoadErrors(null)
        setPatternId(pattern.patternId)
        populateForm(result.data, setProjectName, setYarn, setStartDate, setPatternLines)
      })
      .catch(() => setLoadErrors(['Failed to load pattern.']))
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
        const result = validatePattern(parsed)
        if (!result.ok) {
          setLoadErrors(result.errors)
        } else {
          setLoadErrors(null)
          setPatternId(null)
          populateForm(result.data, setProjectName, setYarn, setStartDate, setPatternLines)
        }
      } catch {
        setLoadErrors(['File is not valid JSON.'])
      }
      e.target.value = ''
    }
    reader.readAsText(file)
  }

  function buildPayload() {
    return {
      patternId,
      projectName,
      yarnName: yarn.name,
      yarnGauge: yarn.gauge,
      yarnMaterial: yarn.material,
      yarnColor: yarn.color,
      startDate,
      patternLines,
    }
  }

  async function savePattern(): Promise<{ success?: boolean; patternId?: string; error?: string }> {
    const res = await fetch('/api/savepattern', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildPayload()),
    })
    return res.json()
  }

  async function createPattern(): Promise<string | null> {
    const data = await savePattern()
    if (data.success && data.patternId) {
      setPatternId(data.patternId)
      fetchPatterns()
      return data.patternId
    }
    return null
  }

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (!window.confirm('Save this pattern?')) return
    const data = await savePattern()
    if (data.success && data.patternId) {
      setPatternId(data.patternId)
    }
    fetchPatterns()
  }

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg="white" borderBottom="3px solid" borderColor="purple.400" px={6} py={4} mb={6}>
        <Container maxW="6xl">
          <Heading
            fontSize="3xl"
            fontWeight="700"
            style={{ fontFamily: "'Fredoka', sans-serif" }}
            bgGradient="to-r"
            gradientFrom="purple.500"
            gradientTo="pink.400"
            bgClip="text"
          >
            Hookbook
          </Heading>
        </Container>
      </Box>

      <Container maxW="6xl" px={6}>
        {loadErrors && (
          <Alert.Root status="warning" mb={6} borderRadius="xl">
            <Alert.Indicator />
            <Box flex="1">
              <Alert.Title>Oops — something's off</Alert.Title>
              <Alert.Description>
                {loadErrors.map((err, i) => (
                  <Box key={i}>{err}</Box>
                ))}
              </Alert.Description>
            </Box>
            <CloseButton onClick={() => setLoadErrors(null)} position="relative" />
          </Alert.Root>
        )}

        <Flex gap={8} direction={{ base: 'column', md: 'row' }}>
          {/* Left Panel — Form */}
          <Box flex="3">
            <Box
              as="form"
              onSubmit={handleSubmit}
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              p={8}
            >
              <Fieldset.Root>
                <Stack gap={6}>
                  <Fieldset.Root>
                    <Fieldset.Legend fontWeight="bold" color="pink.500" fontSize="md" borderBottom="2px solid" borderColor="pink.200" pb={1}>
                      Project
                    </Fieldset.Legend>
                    <LabeledTextInput
                      label="Project name"
                      name="projectname"
                      value={projectName}
                      onChange={setProjectName}
                      placeholder="Project name?"
                      required
                    />
                  </Fieldset.Root>

                  <Fieldset.Root>
                    <Fieldset.Legend fontWeight="bold" color="purple.500" fontSize="md" borderBottom="2px solid" borderColor="purple.200" pb={1}>
                      Yarn
                    </Fieldset.Legend>
                    <YarnFields yarn={yarn} onChange={setYarn} />
                  </Fieldset.Root>

                  <Field.Root required>
                    <Field.Label fontWeight="semibold">When did you start?</Field.Label>
                    <Input
                      type="date"
                      name="startdate"
                      id="startdate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      borderRadius="lg"
                      borderWidth="1px"
                      borderColor="gray.200"
                    />
                  </Field.Root>

                  <PatternEditor lines={patternLines} onChange={setPatternLines} />

                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    borderRadius="xl"
                    colorPalette="purple"
                    fontWeight="bold"
                    fontSize="lg"
                    _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg', opacity: 0.9 }}
                    transition="all 0.15s"
                  >
                    Save Pattern
                  </Button>
                </Stack>
              </Fieldset.Root>
            </Box>
          </Box>

          {/* Right Panel — My Patterns */}
          <Box flex="2">
            <Box
              bg="white"
              borderRadius="2xl"
              boxShadow="sm"
              p={6}
            >
              <Text fontWeight="bold" fontSize="lg" mb={4} color="pink.500"
                style={{ fontFamily: "'Fredoka', sans-serif" }}
              >
                My Patterns
              </Text>

              <Stack gap={3}>
                {savedPatterns.length === 0 && (
                  <Text fontSize="sm" color="gray.400" textAlign="center" py={4}>
                    No saved patterns yet
                  </Text>
                )}
                {savedPatterns.map((pattern) => (
                  <PatternCard
                    key={pattern.patternId}
                    pattern={pattern}
                    isActive={patternId === pattern.patternId}
                    onClick={() => handleLoadPattern(pattern)}
                  />
                ))}
              </Stack>

              <Box mt={6} pt={4} borderTop="1px solid" borderColor="gray.200">
                <Text fontSize="sm" color="gray.500" mb={2} fontWeight="semibold">
                  Or upload a file
                </Text>
                <Button
                  as="label"
                  htmlFor="file-upload"
                  colorPalette="pink"
                  variant="outline"
                  borderRadius="lg"
                  w="full"
                  cursor="pointer"
                  borderStyle="dashed"
                  borderWidth="2px"
                  _hover={{ bg: 'pink.50', borderColor: 'pink.400', transform: 'scale(1.02)' }}
                  transition="all 0.15s"
                >
                  Upload .json file
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    display="none"
                  />
                </Button>
              </Box>

              <Box mt={6} pt={4} borderTop="1px solid" borderColor="gray.200">
                <ReferenceImages
                  patternId={patternId}
                  onCreatePattern={createPattern}
                />
              </Box>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}

export default App
