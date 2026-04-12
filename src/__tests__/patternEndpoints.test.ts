import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'fs/promises'
import fsSync from 'fs'

vi.mock('fs/promises')
vi.mock('fs')

import { listPatterns, loadPattern, pruneVersions } from '../index'

describe('listPatterns', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns pattern summaries from latest version files', async () => {
    vi.mocked(fsSync.existsSync).mockReturnValue(true)
    ;(vi.mocked(fs.readdir) as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { name: 'Scarf_20260410-080000', isDirectory: () => true },
      { name: 'Hat_20260411-090000', isDirectory: () => true },
    ])

    // versions/ listing for each pattern
    ;(vi.mocked(fs.readdir) as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(['v_20260410-080000-000.json'])
      .mockResolvedValueOnce(['v_20260411-090000-000.json', 'v_20260411-100000-000.json'])

    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(JSON.stringify({
        projectName: 'Scarf',
        yarnGauge: 'dk',
        yarnColor: 'blue',
        startDate: '2026-03-15',
        patternLines: ['10sc'],
      }))
      .mockResolvedValueOnce(JSON.stringify({
        projectName: 'Hat',
        yarnGauge: 'worsted',
        yarnColor: 'red',
        startDate: '2026-04-01',
        patternLines: ['6sc'],
      }))

    const result = await listPatterns()
    expect(result).toEqual([
      {
        patternId: 'Scarf_20260410-080000',
        projectName: 'Scarf',
        startDate: '2026-03-15',
        latestVersion: 'v_20260410-080000-000.json',
        yarnGauge: 'dk',
        yarnColor: 'blue',
        patternLines: ['10sc'],
      },
      {
        patternId: 'Hat_20260411-090000',
        projectName: 'Hat',
        startDate: '2026-04-01',
        latestVersion: 'v_20260411-100000-000.json',
        yarnGauge: 'worsted',
        yarnColor: 'red',
        patternLines: ['6sc'],
      },
    ])
  })

  it('returns empty array when data directory does not exist', async () => {
    vi.mocked(fsSync.existsSync).mockReturnValue(false)

    const result = await listPatterns()
    expect(result).toEqual([])
  })

  it('skips directories without version files', async () => {
    vi.mocked(fsSync.existsSync).mockReturnValue(true)
    ;(vi.mocked(fs.readdir) as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { name: 'Good_20260410-080000', isDirectory: () => true },
      { name: 'Empty_20260411-090000', isDirectory: () => true },
    ])

    ;(vi.mocked(fs.readdir) as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(['v_20260410-080000-000.json'])
      .mockResolvedValueOnce([])  // empty versions/

    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify({
      projectName: 'Good',
      yarnGauge: 'bulky',
      yarnColor: 'red',
      startDate: '2026-01-01',
      patternLines: ['sc'],
    }))

    const result = await listPatterns()
    expect(result).toEqual([
      {
        patternId: 'Good_20260410-080000',
        projectName: 'Good',
        startDate: '2026-01-01',
        latestVersion: 'v_20260410-080000-000.json',
        yarnGauge: 'bulky',
        yarnColor: 'red',
        patternLines: ['sc'],
      },
    ])
  })
})

describe('loadPattern', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns parsed JSON from latest version file', async () => {
    vi.mocked(fsSync.existsSync).mockReturnValue(true)
    ;(vi.mocked(fs.readdir) as ReturnType<typeof vi.fn>).mockResolvedValue([
      'v_20260410-080000-000.json',
      'v_20260410-090000-000.json',
    ])
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify({ projectName: 'test' }))

    const result = await loadPattern('Test_20260410-080000')
    expect(result).toEqual({ ok: true, data: { projectName: 'test' } })
  })

  it('rejects patternId with path traversal (..)', async () => {
    const result = await loadPattern('../etc/passwd')
    expect(result).toEqual({ ok: false, error: 'Invalid pattern ID.' })
  })

  it('rejects patternId with slashes', async () => {
    const result = await loadPattern('sub/dir')
    expect(result).toEqual({ ok: false, error: 'Invalid pattern ID.' })
  })

  it('returns error when pattern directory does not exist', async () => {
    vi.mocked(fsSync.existsSync).mockReturnValue(false)

    const result = await loadPattern('Missing_20260410-080000')
    expect(result).toEqual({ ok: false, error: 'Pattern not found.' })
  })

  it('returns error when versions directory is empty', async () => {
    vi.mocked(fsSync.existsSync).mockReturnValue(true)
    ;(vi.mocked(fs.readdir) as ReturnType<typeof vi.fn>).mockResolvedValue([])

    const result = await loadPattern('Empty_20260410-080000')
    expect(result).toEqual({ ok: false, error: 'Pattern not found.' })
  })
})

describe('pruneVersions', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('deletes oldest files when over limit', async () => {
    const files = Array.from({ length: 12 }, (_, i) =>
      `v_20260401-${String(i).padStart(6, '0')}-000.json`
    )
    ;(vi.mocked(fs.readdir) as ReturnType<typeof vi.fn>).mockResolvedValue(files)
    vi.mocked(fs.unlink).mockResolvedValue(undefined)

    await pruneVersions('/fake/path/versions', 10)

    expect(fs.unlink).toHaveBeenCalledTimes(2)
    expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining('v_20260401-000000-000.json'))
    expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining('v_20260401-000001-000.json'))
  })

  it('does nothing when under limit', async () => {
    const files = ['v_20260401-080000-000.json', 'v_20260401-090000-000.json']
    ;(vi.mocked(fs.readdir) as ReturnType<typeof vi.fn>).mockResolvedValue(files)

    await pruneVersions('/fake/path/versions', 10)

    expect(fs.unlink).not.toHaveBeenCalled()
  })

  it('does nothing when exactly at limit', async () => {
    const files = Array.from({ length: 10 }, (_, i) =>
      `v_20260401-${String(i).padStart(6, '0')}-000.json`
    )
    ;(vi.mocked(fs.readdir) as ReturnType<typeof vi.fn>).mockResolvedValue(files)

    await pruneVersions('/fake/path/versions', 10)

    expect(fs.unlink).not.toHaveBeenCalled()
  })
})
