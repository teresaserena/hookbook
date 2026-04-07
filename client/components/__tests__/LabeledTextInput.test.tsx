import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '../../test-utils'
import { LabeledTextInput } from '../LabeledTextInput'

describe('LabeledTextInput', () => {
  it('renders the label text', () => {
    render(
      <LabeledTextInput label="Name" name="name" value="" onChange={() => {}} />
    )
    expect(screen.getByText('Name')).toBeDefined()
  })

  it('renders input with the provided value', () => {
    render(
      <LabeledTextInput label="Name" name="name" value="hello" onChange={() => {}} />
    )
    const input = document.getElementById('name')!
    expect(input).toHaveProperty('value', 'hello')
  })

  it('calls onChange with the new value when typed into', async () => {
    const handleChange = vi.fn()
    render(
      <LabeledTextInput label="Name" name="name" value="" onChange={handleChange} />
    )
    const input = document.getElementById('name')!
    await userEvent.type(input, 'a')
    expect(handleChange).toHaveBeenCalledWith('a')
  })

  it('renders placeholder text', () => {
    render(
      <LabeledTextInput label="Name" name="name" value="" onChange={() => {}} placeholder="Type here" />
    )
    const input = document.getElementById('name')!
    expect(input).toHaveProperty('placeholder', 'Type here')
  })

  it('marks the field as required when required prop is true', () => {
    render(
      <LabeledTextInput label="Name" name="name" value="" onChange={() => {}} required />
    )
    const input = document.getElementById('name')!
    expect(input).toHaveProperty('required', true)
  })
})
