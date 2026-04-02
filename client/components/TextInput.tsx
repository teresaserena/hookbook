interface TextInputProps {
  name: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

export function TextInput({ name, value, onChange, placeholder, required }: TextInputProps) {
  return (
    <input
      type="text"
      name={name}
      id={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
    />
  )
}
