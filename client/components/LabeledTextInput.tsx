import { Field, Input } from '@chakra-ui/react'

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
      <Field.Label fontWeight="semibold">{label}</Field.Label>
      <Input
        type="text"
        name={name}
        id={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        borderRadius="lg"
        borderWidth="1px"
        borderColor="gray.200"
      />
    </Field.Root>
  )
}
