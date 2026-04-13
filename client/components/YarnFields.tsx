import { Stack } from '@chakra-ui/react'
import { LabeledTextInput } from './LabeledTextInput'

export interface YarnState {
  name: string
  gauge: string
  material: string
  color: string
  hookSize: string
}

interface YarnFieldsProps {
  yarn: YarnState
  onChange: (yarn: YarnState) => void
}

export function YarnFields({ yarn, onChange }: YarnFieldsProps) {
  function setField(field: keyof YarnState, value: string) {
    onChange({ ...yarn, [field]: value })
  }

  return (
    <Stack gap={3}>
      <LabeledTextInput
        label="Brand"
        name="yarnname"
        value={yarn.name}
        onChange={(v) => setField('name', v)}
        placeholder="Enter yarn brand or make something up"
      />
      <LabeledTextInput
        label="Weight"
        name="yarngauge"
        value={yarn.gauge}
        onChange={(v) => setField('gauge', v)}
        placeholder="e.g. worsted, DK, bulky"
        required
      />
      <LabeledTextInput
        label="Material"
        name="yarnmaterial"
        value={yarn.material}
        onChange={(v) => setField('material', v)}
        placeholder="e.g. acrylic, wool, cotton"
      />
      <LabeledTextInput
        label="Color"
        name="yarncolor"
        value={yarn.color}
        onChange={(v) => setField('color', v)}
        placeholder="Yarn color"
        required
      />
      <LabeledTextInput
        label="Hook Size"
        name="hooksize"
        value={yarn.hookSize}
        onChange={(v) => setField('hookSize', v)}
        placeholder="e.g. 5.0mm, G/6, H/8"
      />
    </Stack>
  )
}
