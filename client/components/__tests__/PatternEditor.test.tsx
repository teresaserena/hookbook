import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '../../test-utils'
import { PatternEditor } from '../PatternEditor'
import type { Section } from '../../utils/sections'

function sections(...ss: Array<Partial<Section>>): Section[] {
  return ss.map((s, i) => ({
    id: s.id ?? `s${i}`,
    label: s.label ?? '',
    lines: s.lines ?? [],
  }))
}

describe('PatternEditor', () => {
  it('renders the Pattern legend', () => {
    render(<PatternEditor sections={sections({})} onChange={() => {}} />)
    expect(screen.getByText('Pattern')).toBeDefined()
  })

  it('renders one SectionBlock per section', () => {
    render(
      <PatternEditor
        sections={sections({ label: 'Head' }, { label: 'Body' })}
        onChange={() => {}}
      />
    )
    expect(screen.getByDisplayValue('Head')).toBeDefined()
    expect(screen.getByDisplayValue('Body')).toBeDefined()
  })

  it('numbers rows starting at 1 inside each section', () => {
    render(
      <PatternEditor
        sections={sections(
          { id: 'a', label: 'Head', lines: ['sc 6', 'inc 6'] },
          { id: 'b', label: 'Body', lines: ['sc 12'] }
        )}
        onChange={() => {}}
      />
    )
    expect(screen.getAllByText('1.')).toHaveLength(2)
    expect(screen.getAllByText('2.')).toHaveLength(1)
  })

  it('propagates label edits via onChange', async () => {
    const onChange = vi.fn()
    render(<PatternEditor sections={sections({ id: 'a', label: '' })} onChange={onChange} />)
    const labelInput = screen.getByPlaceholderText('unlabeled section')
    await userEvent.type(labelInput, 'H')
    expect(onChange).toHaveBeenCalledWith([
      { id: 'a', label: 'H', lines: [] },
    ])
  })

  it('propagates row additions via onChange on the correct section', async () => {
    const onChange = vi.fn()
    render(
      <PatternEditor
        sections={sections(
          { id: 'a', label: 'Head', lines: ['sc 6'] },
          { id: 'b', label: 'Body', lines: [] }
        )}
        onChange={onChange}
      />
    )
    const addInputs = screen.getAllByPlaceholderText('e.g. 2sc 8[sc inc sc] 2sc')
    await userEvent.type(addInputs[1]!, 'ch 3{enter}')
    expect(onChange).toHaveBeenCalledWith([
      { id: 'a', label: 'Head', lines: ['sc 6'] },
      { id: 'b', label: 'Body', lines: ['ch 3'] },
    ])
  })

  it('disables section-delete when only one section remains', () => {
    render(<PatternEditor sections={sections({ id: 'a' })} onChange={() => {}} />)
    const del = screen.getByLabelText('Delete section') as HTMLButtonElement
    expect(del.disabled).toBe(true)
  })

  it('deletes a section on confirm', async () => {
    window.confirm = vi.fn(() => true)
    const onChange = vi.fn()
    render(
      <PatternEditor
        sections={sections({ id: 'a', label: 'Head' }, { id: 'b', label: 'Body' })}
        onChange={onChange}
      />
    )
    const delButtons = screen.getAllByLabelText('Delete section')
    await userEvent.click(delButtons[0]!)
    expect(onChange).toHaveBeenCalledWith([
      { id: 'b', label: 'Body', lines: [] },
    ])
  })

  it('Add Section appends a new empty section after an empty-state single section', async () => {
    const onChange = vi.fn()
    render(<PatternEditor sections={sections({ id: 'a', label: '' })} onChange={onChange} />)
    await userEvent.click(screen.getByText('+ Add Section'))
    expect(onChange).toHaveBeenCalledTimes(1)
    const arg = onChange.mock.calls[0]![0] as Section[]
    expect(arg).toHaveLength(2)
    expect(arg[0]).toEqual({ id: 'a', label: '', lines: [] })
    expect(arg[1]!.label).toBe('')
    expect(arg[1]!.lines).toEqual([])
    expect(arg[1]!.id).not.toBe('a')
  })

  it('Add Section focuses the existing unlabeled section first when it already has rows', async () => {
    const onChange = vi.fn()
    render(
      <PatternEditor
        sections={sections({ id: 'a', label: '', lines: ['sc 6'] })}
        onChange={onChange}
      />
    )
    await userEvent.click(screen.getByText('+ Add Section'))
    expect(onChange).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(screen.getByPlaceholderText('unlabeled section'))
  })

  it('Add Section appends immediately when the only section is already labeled', async () => {
    const onChange = vi.fn()
    render(
      <PatternEditor
        sections={sections({ id: 'a', label: 'Head', lines: ['sc 6'] })}
        onChange={onChange}
      />
    )
    await userEvent.click(screen.getByText('+ Add Section'))
    expect(onChange).toHaveBeenCalledTimes(1)
    const arg = onChange.mock.calls[0]![0] as Section[]
    expect(arg).toHaveLength(2)
    expect(arg[0]!.label).toBe('Head')
    expect(arg[1]!.label).toBe('')
  })
})
