import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs'

vi.mock('fs')

import { listPatternFiles, loadPatternFile } from '../index'

describe('listPatternFiles', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns pattern data objects for each .json file', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    ;(vi.mocked(fs.readdirSync) as ReturnType<typeof vi.fn>).mockReturnValue(
      ['butts.json', 'scarf.json', 'notes.txt']
    )
    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce(JSON.stringify({
        projectName: 'butts',
        yarnGauge: 'worsted',
        yarnColor: 'black',
        startDate: '2026-04-02',
        patternLines: ['2sc inc 2sc'],
      }))
      .mockReturnValueOnce(JSON.stringify({
        projectName: 'scarf',
        yarnGauge: 'dk',
        yarnColor: 'blue',
        startDate: '2026-03-15',
        patternLines: ['10sc'],
      }))

    const result = listPatternFiles()
    expect(result).toEqual([
      {
        filename: 'butts.json',
        projectName: 'butts',
        yarnGauge: 'worsted',
        yarnColor: 'black',
        startDate: '2026-04-02',
        patternLines: ['2sc inc 2sc'],
      },
      {
        filename: 'scarf.json',
        projectName: 'scarf',
        yarnGauge: 'dk',
        yarnColor: 'blue',
        startDate: '2026-03-15',
        patternLines: ['10sc'],
      },
    ])
  })

  it('returns empty array when data directory does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false)

    const result = listPatternFiles()
    expect(result).toEqual([])
  })

  it('skips files that fail to parse', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true)
    ;(vi.mocked(fs.readdirSync) as ReturnType<typeof vi.fn>).mockReturnValue(
      ['good.json', 'bad.json']
    )
    vi.mocked(fs.readFileSync)
      .mockReturnValueOnce(JSON.stringify({
        projectName: 'good',
        yarnGauge: 'bulky',
        yarnColor: 'red',
        startDate: '2026-01-01',
        patternLines: ['sc'],
      }))
      .mockReturnValueOnce('not valid json{{{')

    const result = listPatternFiles()
    expect(result).toEqual([
      {
        filename: 'good.json',
        projectName: 'good',
        yarnGauge: 'bulky',
        yarnColor: 'red',
        startDate: '2026-01-01',
        patternLines: ['sc'],
      },
    ])
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
