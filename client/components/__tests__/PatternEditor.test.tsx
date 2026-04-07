import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '../../test-utils'
import { PatternEditor } from '../PatternEditor'

describe('PatternEditor', () => {
  it('renders the Pattern legend', () => {
    render(<PatternEditor lines={[]} onChange={() => {}} />)
    expect(screen.getByText('Pattern')).toBeDefined()
  })

  it('renders existing lines with row numbers', () => {
    render(<PatternEditor lines={['sc 6', 'inc 6']} onChange={() => {}} />)
    expect(screen.getByText('1.')).toBeDefined()
    expect(screen.getByText('2.')).toBeDefined()
  })

  it('calls onChange with new line appended when Add is clicked', async () => {
    const handleChange = vi.fn()
    render(<PatternEditor lines={['sc 6']} onChange={handleChange} />)
    await userEvent.type(document.getElementById('pattern-new-line')!, 'inc 6')
    await userEvent.click(screen.getByText('Add'))
    expect(handleChange).toHaveBeenCalledWith(['sc 6', 'inc 6'])
  })

  it('calls onChange with new line when Enter is pressed', async () => {
    const handleChange = vi.fn()
    render(<PatternEditor lines={[]} onChange={handleChange} />)
    await userEvent.type(document.getElementById('pattern-new-line')!, 'sc 6{enter}')
    expect(handleChange).toHaveBeenCalledWith(['sc 6'])
  })

  it('does not add empty lines', async () => {
    const handleChange = vi.fn()
    render(<PatternEditor lines={[]} onChange={handleChange} />)
    await userEvent.click(screen.getByText('Add'))
    expect(handleChange).not.toHaveBeenCalled()
  })

  it('calls onChange with updated line when an existing line is edited', async () => {
    const handleChange = vi.fn()
    render(<PatternEditor lines={['sc 6']} onChange={handleChange} />)
    // Since lines prop is static (vi.fn doesn't update state), typing appends to 'sc 6'
    await userEvent.type(document.getElementById('pattern-line-0')!, '8')
    expect(handleChange).toHaveBeenCalledWith(['sc 68'])
  })

  it('calls onChange with line removed when X is clicked and confirmed', async () => {
    const handleChange = vi.fn()
    window.confirm = vi.fn(() => true)
    render(<PatternEditor lines={['sc 6', 'inc 6']} onChange={handleChange} />)
    const removeButtons = screen.getAllByText('X')
    await userEvent.click(removeButtons[0]!)
    expect(window.confirm).toHaveBeenCalled()
    expect(handleChange).toHaveBeenCalledWith(['inc 6'])
  })

  it('does not remove line when confirm is cancelled', async () => {
    const handleChange = vi.fn()
    window.confirm = vi.fn(() => false)
    render(<PatternEditor lines={['sc 6']} onChange={handleChange} />)
    await userEvent.click(screen.getByText('X'))
    expect(handleChange).not.toHaveBeenCalled()
  })
})
