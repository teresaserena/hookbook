import { describe, it, expect } from 'vitest'
import { yarnColorToCss } from '../colorMap'

describe('yarnColorToCss', () => {
  it('maps common color names to CSS values', () => {
    expect(yarnColorToCss('red')).toBe('#e53e3e')
    expect(yarnColorToCss('blue')).toBe('#3182ce')
    expect(yarnColorToCss('black')).toBe('#1a202c')
    expect(yarnColorToCss('white')).toBe('#f7fafc')
    expect(yarnColorToCss('green')).toBe('#38a169')
    expect(yarnColorToCss('pink')).toBe('#d53f8c')
    expect(yarnColorToCss('purple')).toBe('#805ad5')
    expect(yarnColorToCss('orange')).toBe('#dd6b20')
    expect(yarnColorToCss('yellow')).toBe('#d69e2e')
    expect(yarnColorToCss('teal')).toBe('#319795')
    expect(yarnColorToCss('gray')).toBe('#a0aec0')
    expect(yarnColorToCss('brown')).toBe('#8b6914')
  })

  it('is case insensitive', () => {
    expect(yarnColorToCss('Red')).toBe('#e53e3e')
    expect(yarnColorToCss('BLUE')).toBe('#3182ce')
  })

  it('returns fallback gray for unknown colors', () => {
    expect(yarnColorToCss('chartreuse')).toBe('#a0aec0')
    expect(yarnColorToCss('rainbow sparkle')).toBe('#a0aec0')
    expect(yarnColorToCss('')).toBe('#a0aec0')
  })
})
