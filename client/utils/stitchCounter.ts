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
  `(\\d+|${sortedAbbreviations.join('|')}|[\\[\\]{}()])`,
  'gi'
)

export function parseStitchCount(line: string, previousCount?: number): number {
  const tokens = line.match(TOKEN_REGEX)
  if (!tokens) return 0

  let i = 0

  function parseGroup(): number {
    let total = 0
    let multiplier: number | null = null
    let lastContribution = 0

    while (i < tokens.length) {
      const token = tokens[i]

      if (token === ']' || token === '}' || token === ')') {
        i++
        return total
      }

      if (token === '[' || token === '{' || token === '(') {
        i++
        const groupTotal = parseGroup() * (multiplier ?? 1)
        total += groupTotal
        lastContribution = groupTotal
        multiplier = null
        continue
      }

      if (/^\d+$/.test(token)) {
        const num = parseInt(token, 10)
        // Lookahead: if next token is a stitch or bracket, this is a pre-multiplier
        const next = i + 1 < tokens.length ? tokens[i + 1] : null
        const nextIsStitchOrBracket = next !== null && (
          /^[a-z]/i.test(next) || next === '[' || next === '{' || next === '('
        )
        if (lastContribution > 0 && multiplier === null && !nextIsStitchOrBracket) {
          // Post-fix: "ch3" — retroactively multiply the last stitch
          total += lastContribution * (num - 1)
          lastContribution = lastContribution * num
        } else {
          multiplier = num
          lastContribution = 0
        }
        i++
        continue
      }

      const lower = token.toLowerCase()

      if (lower === StitchTypes.Repeat) {
        const contribution = previousCount ?? 0
        total += contribution
        lastContribution = contribution
        multiplier = null
        i++
        continue
      }

      const value = STITCH_VALUES.get(lower)
      if (value !== undefined) {
        const contribution = value * (multiplier ?? 1)
        total += contribution
        lastContribution = contribution
        multiplier = null
      } else {
        lastContribution = 0
      }

      i++
    }

    return total
  }

  return parseGroup()
}
