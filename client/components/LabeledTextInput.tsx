import { Field } from '@chakra-ui/react'
import { TextInput } from './TextInput'

interface LabeledTextInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function LabeledTextInput({ label, name, value, onChange, placeholder, required }: LabeledTextInputProps) {
  return (
    <Field.Root required={required}>
      <Field.Label>{label}</Field.Label>
      <TextInput
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </Field.Root>
  )
}
