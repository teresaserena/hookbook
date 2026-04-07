import { describe, it, expect, vi } from 'vitest'
import { render, screen, userEvent } from '../../test-utils'
import { YarnFields } from '../YarnFields'
import type { YarnState } from '../YarnFields'

const emptyYarn: YarnState = { name: '', gauge: '', material: '', color: '' }

describe('YarnFields', () => {
  it('renders all four labeled fields', () => {
    render(<YarnFields yarn={emptyYarn} onChange={() => {}} />)
    expect(screen.getByText('Brand')).toBeDefined()
    expect(screen.getByText('Weight')).toBeDefined()
    expect(screen.getByText('Material')).toBeDefined()
    expect(screen.getByText('Color')).toBeDefined()
  })

  it('displays current yarn values in inputs', () => {
    const yarn: YarnState = { name: 'Bernat', gauge: 'worsted', material: 'acrylic', color: 'red' }
    render(<YarnFields yarn={yarn} onChange={() => {}} />)
    expect(document.getElementById('yarnname')).toHaveProperty('value', 'Bernat')
    expect(document.getElementById('yarngauge')).toHaveProperty('value', 'worsted')
    expect(document.getElementById('yarnmaterial')).toHaveProperty('value', 'acrylic')
    expect(document.getElementById('yarncolor')).toHaveProperty('value', 'red')
  })

  it('calls onChange with updated name when Brand field is typed into', async () => {
    const handleChange = vi.fn()
    render(<YarnFields yarn={emptyYarn} onChange={handleChange} />)
    await userEvent.type(document.getElementById('yarnname')!, 'a')
    expect(handleChange).toHaveBeenCalledWith({ ...emptyYarn, name: 'a' })
  })

  it('calls onChange with updated gauge when Weight field is typed into', async () => {
    const handleChange = vi.fn()
    render(<YarnFields yarn={emptyYarn} onChange={handleChange} />)
    await userEvent.type(document.getElementById('yarngauge')!, 'a')
    expect(handleChange).toHaveBeenCalledWith({ ...emptyYarn, gauge: 'a' })
  })

  it('marks Weight and Color as required', () => {
    render(<YarnFields yarn={emptyYarn} onChange={() => {}} />)
    expect(document.getElementById('yarngauge')).toHaveProperty('required', true)
    expect(document.getElementById('yarncolor')).toHaveProperty('required', true)
  })
})
