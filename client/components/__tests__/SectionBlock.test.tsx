import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, userEvent } from '../../test-utils'
import { SectionBlock } from '../SectionBlock'

function setup(partial: Partial<React.ComponentProps<typeof SectionBlock>> = {}) {
  const props: React.ComponentProps<typeof SectionBlock> = {
    section: { id: 's1', label: '', lines: [] },
    canDelete: true,
    onLabelChange: vi.fn(),
    onLinesChange: vi.fn(),
    onDelete: vi.fn(),
    ...partial,
  }
  render(<SectionBlock {...props} />)
  return props
}

describe('SectionBlock', () => {
  it('shows "unlabeled" placeholder when label is empty', () => {
    setup({ section: { id: 's1', label: '', lines: [] } })
    const labelInput = screen.getByPlaceholderText('unlabeled section') as HTMLInputElement
    expect(labelInput.value).toBe('')
  })

  it('shows the label when set', () => {
    setup({ section: { id: 's1', label: 'Head', lines: [] } })
    const labelInput = screen.getByDisplayValue('Head')
    expect(labelInput).toBeDefined()
  })

  it('calls onLabelChange when the label is edited', async () => {
    const onLabelChange = vi.fn()
    setup({ section: { id: 's1', label: '', lines: [] }, onLabelChange })
    const labelInput = screen.getByPlaceholderText('unlabeled section')
    await userEvent.type(labelInput, 'H')
    expect(onLabelChange).toHaveBeenCalledWith('H')
  })

  it('renders row numbers starting from 1 inside the section', () => {
    setup({ section: { id: 's1', label: 'Head', lines: ['sc 6', 'inc 6'] } })
    expect(screen.getByText('1.')).toBeDefined()
    expect(screen.getByText('2.')).toBeDefined()
  })

  it('appends a new row via onLinesChange when Add is clicked', async () => {
    const onLinesChange = vi.fn()
    setup({ section: { id: 's1', label: '', lines: ['sc 6'] }, onLinesChange })
    const newInput = screen.getByPlaceholderText('e.g. 2sc 8[sc inc sc] 2sc')
    await userEvent.type(newInput, 'inc 6')
    await userEvent.click(screen.getByText('Add'))
    expect(onLinesChange).toHaveBeenCalledWith(['sc 6', 'inc 6'])
  })

  it('submits new row on Enter', async () => {
    const onLinesChange = vi.fn()
    setup({ section: { id: 's1', label: '', lines: [] }, onLinesChange })
    const newInput = screen.getByPlaceholderText('e.g. 2sc 8[sc inc sc] 2sc')
    await userEvent.type(newInput, 'sc 6{enter}')
    expect(onLinesChange).toHaveBeenCalledWith(['sc 6'])
  })

  it('removes a row when X is clicked and confirmed', async () => {
    window.confirm = vi.fn(() => true)
    const onLinesChange = vi.fn()
    setup({ section: { id: 's1', label: '', lines: ['sc 6', 'inc 6'] }, onLinesChange })
    const removeButtons = screen.getAllByText('X')
    // top-to-bottom rendering; removeButtons[0] is the section-delete, [1] is row 1's X
    // Actually the section-delete button has aria-label "Delete section" and also text "X".
    // To be unambiguous, filter to only row Xs by their parent:
    const rowRemoves = removeButtons.filter((b) => b.getAttribute('aria-label') !== 'Delete section')
    await userEvent.click(rowRemoves[0]!)
    expect(onLinesChange).toHaveBeenCalledWith(['inc 6'])
  })

  it('disables the section-delete button when canDelete is false', () => {
    setup({ canDelete: false })
    const del = screen.getByLabelText('Delete section') as HTMLButtonElement
    expect(del.disabled).toBe(true)
  })

  it('calls onDelete when section-delete is clicked and confirmed', async () => {
    window.confirm = vi.fn(() => true)
    const onDelete = vi.fn()
    setup({ onDelete })
    await userEvent.click(screen.getByLabelText('Delete section'))
    expect(window.confirm).toHaveBeenCalled()
    expect(onDelete).toHaveBeenCalled()
  })

  it('does not call onDelete when the confirm is cancelled', async () => {
    window.confirm = vi.fn(() => false)
    const onDelete = vi.fn()
    setup({ onDelete })
    await userEvent.click(screen.getByLabelText('Delete section'))
    expect(onDelete).not.toHaveBeenCalled()
  })
})
