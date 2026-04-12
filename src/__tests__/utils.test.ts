import { describe, it, expect, vi } from 'vitest'
import { generatePatternId, generateVersionFilename } from '../utils'

describe('generatePatternId', () => {
  it('sanitizes project name and appends timestamp', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-12T14:30:22.000Z'))

    const result = generatePatternId('My Cool Pattern')
    expect(result).toBe('My-Cool-Pattern_20260412-143022')

    vi.useRealTimers()
  })

  it('strips unsafe characters', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-12T14:30:22.000Z'))

    const result = generatePatternId('hello@world!#')
    expect(result).toBe('helloworld_20260412-143022')

    vi.useRealTimers()
  })

  it('collapses multiple spaces into single hyphen', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-12T14:30:22.000Z'))

    const result = generatePatternId('too   many   spaces')
    expect(result).toBe('too-many-spaces_20260412-143022')

    vi.useRealTimers()
  })
})

describe('generateVersionFilename', () => {
  it('returns filename with timestamp and milliseconds', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-12T14:30:22.456Z'))

    const result = generateVersionFilename()
    expect(result).toBe('v_20260412-143022-456.json')

    vi.useRealTimers()
  })

  it('pads milliseconds to 3 digits', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-12T14:30:22.007Z'))

    const result = generateVersionFilename()
    expect(result).toBe('v_20260412-143022-007.json')

    vi.useRealTimers()
  })
})
