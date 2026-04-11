import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'

vi.mock('fs')

// Import after mocking
import { listPatternFiles, loadPatternFile } from '../index'

describe('listPatternFiles', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns only .json files from the data directory', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    ;(vi.mocked(fs.readdirSync) as ReturnType<typeof vi.fn>).mockReturnValue(
      ['butts.json', 'scarf.json', 'notes.txt']
    )

    const result = listPatternFiles()
    expect(result).toEqual(['butts.json', 'scarf.json'])
  })

  it('returns empty array when data directory does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const result = listPatternFiles()
    expect(result).toEqual([])
  })
})

describe('loadPatternFile', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns parsed JSON for a valid filename', () => {
    const content = JSON.stringify({ projectName: 'test' })
    vi.mocked(fs.existsSync).mockReturnValue(true)
    vi.mocked(fs.readFileSync).mockReturnValue(content)

    const result = loadPatternFile('test.json')
    expect(result).toEqual({ ok: true, data: { projectName: 'test' } })
  })

  it('rejects filenames with path traversal (..)', () => {
    const result = loadPatternFile('../etc/passwd')
    expect(result).toEqual({ ok: false, error: 'Invalid filename.' })
  })

  it('rejects filenames with slashes', () => {
    const result = loadPatternFile('sub/dir.json')
    expect(result).toEqual({ ok: false, error: 'Invalid filename.' })
  })

  it('returns error when file does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const result = loadPatternFile('missing.json')
    expect(result).toEqual({ ok: false, error: 'File not found.' })
  })
})
