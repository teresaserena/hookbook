import { useState } from 'react'
import { Box, Container, Heading, Input, Stack, Field, Fieldset } from '@chakra-ui/react'
import { TextInput } from './components/TextInput'

function App() {
  const [projectName, setProjectName] = useState('')
  const [yarnName, setYarnName] = useState('')
  const [yarnGauge, setYarnGauge] = useState('')
  const [yarnMaterial, setYarnMaterial] = useState('')
  const [yarnColor, setYarnColor] = useState('')
  const [startDate, setStartDate] = useState('')

  return (
    <Container maxW="lg" py={10}>
      <Heading mb={8}>Hookbook</Heading>
      <Box as="form">
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
          </Stack>
        </Fieldset.Root>
      </Box>
    </Container>
  )
}

export default App
