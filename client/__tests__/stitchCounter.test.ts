import { describe, it, expect } from 'vitest'
import { parseStitchCount } from '../utils/stitchCounter'

describe('parseStitchCount', () => {
  describe('single stitches', () => {
    it('counts a single stitch', () => {
      expect(parseStitchCount('sc')).toBe(1)
    })

    it('counts each standard stitch as 1', () => {
      expect(parseStitchCount('dc')).toBe(1)
      expect(parseStitchCount('hdc')).toBe(1)
      expect(parseStitchCount('tr')).toBe(1)
      expect(parseStitchCount('slst')).toBe(1)
      expect(parseStitchCount('ch')).toBe(1)
      expect(parseStitchCount('blo')).toBe(1)
      expect(parseStitchCount('flo')).toBe(1)
      expect(parseStitchCount('fp')).toBe(1)
      expect(parseStitchCount('bp')).toBe(1)
      expect(parseStitchCount('pop')).toBe(1)
    })
  })

  describe('multiplied stitches', () => {
    it('counts "2sc" as 2', () => {
      expect(parseStitchCount('2sc')).toBe(2)
    })

    it('counts "2 sc" (with space) as 2', () => {
      expect(parseStitchCount('2 sc')).toBe(2)
    })

    it('counts "10dc" as 10', () => {
      expect(parseStitchCount('10dc')).toBe(10)
    })
  })

  describe('space-separated stitches', () => {
    it('counts "sc tr sc" as 3', () => {
      expect(parseStitchCount('sc tr sc')).toBe(3)
    })

    it('counts "sc dc hdc" as 3', () => {
      expect(parseStitchCount('sc dc hdc')).toBe(3)
    })
  })

  describe('bracket repeats', () => {
    it('counts "2[sc tr sc]" as 6', () => {
      expect(parseStitchCount('2[sc tr sc]')).toBe(6)
    })

    it('counts "2{sc tr sc}" with curly brackets as 6', () => {
      expect(parseStitchCount('2{sc tr sc}')).toBe(6)
    })

    it('counts brackets without multiplier as 1x', () => {
      expect(parseStitchCount('[sc tr sc]')).toBe(3)
    })

    it('handles brackets with surrounding stitches', () => {
      // 2sc + 8[sc inc sc] + 2sc = 2 + 8*(1+2+1) + 2 = 36
      expect(parseStitchCount('2sc 8[sc inc sc] 2sc')).toBe(36)
    })
  })

  describe('special stitches', () => {
    it('counts inc as 2 stitches', () => {
      expect(parseStitchCount('inc')).toBe(2)
    })

    it('counts "2 inc" as 4 stitches', () => {
      expect(parseStitchCount('2 inc')).toBe(4)
    })

    it('counts dec as 1 stitch', () => {
      expect(parseStitchCount('dec')).toBe(1)
    })

    it('ignores yo (0 stitches)', () => {
      expect(parseStitchCount('yo')).toBe(0)
    })

    it('ignores yo when combined with other stitches', () => {
      expect(parseStitchCount('yo dc')).toBe(1)
    })

    it('counts rnd as 0 stitches', () => {
      expect(parseStitchCount('rnd')).toBe(0)
    })
  })

  describe('repeat (rep)', () => {
    it('uses previous count when provided', () => {
      expect(parseStitchCount('rep', 12)).toBe(12)
    })

    it('returns 0 when no previous count', () => {
      expect(parseStitchCount('rep')).toBe(0)
    })
  })

  describe('mixed text', () => {
    it('ignores non-stitch text', () => {
      expect(parseStitchCount('do 2sc here')).toBe(2)
    })

    it('handles text around stitches', () => {
      expect(parseStitchCount('start with sc then dc')).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('returns 0 for empty string', () => {
      expect(parseStitchCount('')).toBe(0)
    })

    it('returns 0 for text with no stitches', () => {
      expect(parseStitchCount('hello world')).toBe(0)
    })

    it('is case insensitive', () => {
      expect(parseStitchCount('SC')).toBe(1)
      expect(parseStitchCount('2DC')).toBe(2)
    })

    it('handles complex patterns', () => {
      // 6sc = 6, inc = 2, 3[sc inc] = 3*(1+2) = 9 => total 17
      expect(parseStitchCount('6sc inc 3[sc inc]')).toBe(17)
    })
  })
})
