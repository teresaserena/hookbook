import { StitchTypes } from '../types/stitchTypes'

const STITCH_VALUES = new Map<string, number>(
  Object.values(StitchTypes).map((abbr) => {
    switch (abbr) {
      case StitchTypes.Increase:
        return [abbr, 2]
      case StitchTypes.YarnOver:
      case StitchTypes.Round:
      case StitchTypes.Repeat:
        return [abbr, 0]
      default:
        return [abbr, 1]
    }
  })
)

// Sort longest-first so "slst" matches before "sl" would
const sortedAbbreviations = (Object.values(StitchTypes) as string[])
  .sort((a, b) => b.length - a.length)

const TOKEN_REGEX = new RegExp(
  `(\\d+|${sortedAbbreviations.join('|')}|[\\[\\]{}])`,
  'gi'
)

export function parseStitchCount(line: string, previousCount?: number): number {
  const tokens = line.match(TOKEN_REGEX)
  if (!tokens) return 0

  let i = 0

  function parseGroup(): number {
    let total = 0
    let multiplier: number | null = null

    while (i < tokens.length) {
      const token = tokens[i]

      if (token === ']' || token === '}') {
        i++
        return total
      }

      if (token === '[' || token === '{') {
        i++
        total += parseGroup() * (multiplier ?? 1)
        multiplier = null
        continue
      }

      if (/^\d+$/.test(token)) {
        multiplier = parseInt(token, 10)
        i++
        continue
      }

      const lower = token.toLowerCase()

      if (lower === StitchTypes.Repeat) {
        total += previousCount ?? 0
        multiplier = null
        i++
        continue
      }

      const value = STITCH_VALUES.get(lower)
      if (value !== undefined) {
        total += value * (multiplier ?? 1)
        multiplier = null
      }

      i++
    }

    return total
  }

  return parseGroup()
}
