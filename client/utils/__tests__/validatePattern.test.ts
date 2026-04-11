import { describe, it, expect } from 'vitest'
import { validatePattern } from '../validatePattern'

describe('validatePattern', () => {
  const validPattern = {
    projectName: 'Test Pattern',
    yarnGauge: 'worsted',
    yarnColor: 'blue',
    startDate: '2026-01-15',
    patternLines: ['2sc inc 2sc', 'sc sc sc'],
  }

  it('returns data for a fully valid pattern', () => {
    const result = validatePattern(validPattern)
    expect(result).toEqual({
      ok: true,
      data: {
        projectName: 'Test Pattern',
        yarnName: '',
        yarnGauge: 'worsted',
        yarnMaterial: '',
        yarnColor: 'blue',
        startDate: '2026-01-15',
        patternLines: ['2sc inc 2sc', 'sc sc sc'],
      },
    })
  })

  it('fills in optional fields when present', () => {
    const result = validatePattern({
      ...validPattern,
      yarnName: 'Cascade 220',
      yarnMaterial: 'wool',
    })
    expect(result).toEqual({
      ok: true,
      data: {
        projectName: 'Test Pattern',
        yarnName: 'Cascade 220',
        yarnGauge: 'worsted',
        yarnMaterial: 'wool',
        yarnColor: 'blue',
        startDate: '2026-01-15',
        patternLines: ['2sc inc 2sc', 'sc sc sc'],
      },
    })
  })

  it('rejects non-object input', () => {
    expect(validatePattern(null)).toEqual({
      ok: false,
      errors: ['Pattern must be a JSON object.'],
    })
    expect(validatePattern('hello')).toEqual({
      ok: false,
      errors: ['Pattern must be a JSON object.'],
    })
    expect(validatePattern([1, 2])).toEqual({
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
      expect(result.errors).toContain('patternLines must be a non-empty array of strings.')
    }
  })

  it('rejects empty strings for required string fields', () => {
    const result = validatePattern({
      ...validPattern,
      projectName: '',
      yarnGauge: '  ',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('Missing required field: projectName')
      expect(result.errors).toContain('Missing required field: yarnGauge')
    }
  })

  it('rejects non-string values for required string fields', () => {
    const result = validatePattern({
      ...validPattern,
      projectName: 123,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('Missing required field: projectName')
    }
  })

  it('rejects empty patternLines array', () => {
    const result = validatePattern({ ...validPattern, patternLines: [] })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('patternLines must be a non-empty array of strings.')
    }
  })

  it('rejects patternLines with non-string entries', () => {
    const result = validatePattern({ ...validPattern, patternLines: ['sc', 42] })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('patternLines must be a non-empty array of strings.')
    }
  })

  it('rejects invalid startDate format', () => {
    const result = validatePattern({ ...validPattern, startDate: 'not-a-date' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toContain('startDate must be a valid date (YYYY-MM-DD).')
    }
  })

  it('accepts valid YYYY-MM-DD dates', () => {
    const result = validatePattern({ ...validPattern, startDate: '2025-12-31' })
    expect(result.ok).toBe(true)
  })
})
