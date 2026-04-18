import { describe, it, expect } from 'vitest'
import { validatePattern } from '../validatePattern'

describe('validatePattern', () => {
  const validPattern = {
    projectName: 'Test Pattern',
    yarnGauge: 'worsted',
    yarnColor: 'blue',
    startDate: '2026-01-15',
    sections: [{ label: 'Head', lines: ['2sc inc 2sc', 'sc sc sc'] }],
  }

  it('returns data for a fully valid sectioned pattern', () => {
    const result = validatePattern(validPattern)
    expect(result).toEqual({
      ok: true,
      data: {
        projectName: 'Test Pattern',
        yarnName: '',
        yarnGauge: 'worsted',
        yarnMaterial: '',
        yarnColor: 'blue',
        hookSize: '',
        startDate: '2026-01-15',
        sections: [{ label: 'Head', lines: ['2sc inc 2sc', 'sc sc sc'] }],
      },
    })
  })

  it('accepts multiple sections including empty ones as long as any section has lines', () => {
    const result = validatePattern({
      ...validPattern,
      sections: [
        { label: 'Head', lines: ['sc 6'] },
        { label: '', lines: [] },
        { label: 'Legs', lines: ['inc 6'] },
      ],
    })
    expect(result.ok).toBe(true)
  })

  it('migrates legacy patternLines into a single unlabeled section', () => {
    const legacy = {
      projectName: 'Old',
      yarnGauge: 'worsted',
      yarnColor: 'blue',
      startDate: '2026-01-15',
      patternLines: ['sc 6', 'inc 6'],
    }
    const result = validatePattern(legacy)
    expect(result).toEqual({
      ok: true,
      data: {
        projectName: 'Old',
        yarnName: '',
        yarnGauge: 'worsted',
        yarnMaterial: '',
        yarnColor: 'blue',
        hookSize: '',
        startDate: '2026-01-15',
        sections: [{ label: '', lines: ['sc 6', 'inc 6'] }],
      },
    })
  })

  it('rejects non-object input', () => {
    expect(validatePattern(null)).toEqual({
      ok: false,
      errors: ['Pattern must be a JSON object.'],
    })
  })

  it('reports all missing required fields at once', () => {
    const result = validatePattern({})
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('Missing required field: projectName')
      expect(result.errors).toContain('Missing required field: yarnGauge')
      expect(result.errors).toContain('Missing required field: yarnColor')
      expect(result.errors).toContain('Missing required field: startDate')
      expect(result.errors).toContain('sections must be a non-empty array with at least one line of pattern.')
    }
  })

  it('rejects empty sections array', () => {
    const result = validatePattern({ ...validPattern, sections: [] })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('sections must be a non-empty array with at least one line of pattern.')
    }
  })

  it('rejects sections where every section has zero lines', () => {
    const result = validatePattern({
      ...validPattern,
      sections: [{ label: 'Head', lines: [] }, { label: 'Body', lines: [] }],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('sections must be a non-empty array with at least one line of pattern.')
    }
  })

  it('rejects sections with non-string label', () => {
    const result = validatePattern({
      ...validPattern,
      sections: [{ label: 42, lines: ['sc'] }],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('Each section must have a string label and an array of string lines.')
    }
  })

  it('rejects sections with non-string entries in lines', () => {
    const result = validatePattern({
      ...validPattern,
      sections: [{ label: 'Head', lines: ['sc', 42] }],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('Each section must have a string label and an array of string lines.')
    }
  })

  it('rejects invalid startDate format', () => {
    const result = validatePattern({ ...validPattern, startDate: 'not-a-date' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('startDate must be a valid date (YYYY-MM-DD).')
    }
  })

  it('fills in optional fields when present', () => {
    const result = validatePattern({
      ...validPattern,
      yarnName: 'Cascade 220',
      yarnMaterial: 'wool',
      hookSize: '5.0mm',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.yarnName).toBe('Cascade 220')
      expect(result.data.yarnMaterial).toBe('wool')
      expect(result.data.hookSize).toBe('5.0mm')
    }
  })
})
