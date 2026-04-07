import { describe, it, expect, vi } from 'vitest'
import fs from 'fs'
import { getUniqueFilename } from '../utils'

vi.mock('fs')

describe('getUniqueFilename', () => {
  it('converts project name to a safe filename', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    expect(getUniqueFilename('My Cool Pattern')).toBe('My-Cool-Pattern.json')
  })

  it('strips unsafe characters', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    expect(getUniqueFilename('hello@world!#')).toBe('helloworld.json')
  })

  it('collapses multiple spaces into single hyphen', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    expect(getUniqueFilename('too   many   spaces')).toBe('too-many-spaces.json')
  })

  it('appends counter when filename already exists', () => {
    vi.mocked(fs.existsSync)
      .mockReturnValueOnce(true)   // pattern.json exists
      .mockReturnValueOnce(true)   // pattern-1.json exists
      .mockReturnValueOnce(false)  // pattern-2.json is free
    expect(getUniqueFilename('pattern')).toBe('pattern-2.json')
  })

  it('handles empty-ish names', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)
    expect(getUniqueFilename('   ')).toBe('.json')
  })
})
