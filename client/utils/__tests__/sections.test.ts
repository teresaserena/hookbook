import { describe, it, expect } from 'vitest'
import { makeSection, migratePatternLines, stripSectionIds } from '../sections'

describe('makeSection', () => {
  it('creates an empty section with a non-empty id and empty label/lines by default', () => {
    const s = makeSection()
    expect(typeof s.id).toBe('string')
    expect(s.id.length).toBeGreaterThan(0)
    expect(s.label).toBe('')
    expect(s.lines).toEqual([])
  })

  it('accepts an initial label and lines', () => {
    const s = makeSection({ label: 'Head', lines: ['sc 6'] })
    expect(s.label).toBe('Head')
    expect(s.lines).toEqual(['sc 6'])
  })

  it('produces distinct ids for separate calls', () => {
    expect(makeSection().id).not.toBe(makeSection().id)
  })
})

describe('migratePatternLines', () => {
  it('wraps an array of lines in a single unlabeled section', () => {
    const sections = migratePatternLines(['sc 6', 'inc 6'])
    expect(sections).toHaveLength(1)
    expect(sections[0]!.label).toBe('')
    expect(sections[0]!.lines).toEqual(['sc 6', 'inc 6'])
    expect(typeof sections[0]!.id).toBe('string')
  })
})

describe('stripSectionIds', () => {
  it('returns sections with id removed', () => {
    const stripped = stripSectionIds([
      { id: 'a', label: 'Head', lines: ['sc'] },
      { id: 'b', label: '', lines: [] },
    ])
    expect(stripped).toEqual([
      { label: 'Head', lines: ['sc'] },
      { label: '', lines: [] },
    ])
  })
})
