import type { PersistedSection } from './sections'

export interface PatternData {
  projectName: string
  yarnName: string
  yarnGauge: string
  yarnMaterial: string
  yarnColor: string
  hookSize: string
  startDate: string
  sections: PersistedSection[]
}

type ValidationResult =
  | { ok: true; data: PatternData }
  | { ok: false; errors: string[] }

const SECTIONS_MESSAGE =
  'sections must be a non-empty array with at least one line of pattern.'
const SECTION_SHAPE_MESSAGE =
  'Each section must have a string label and an array of string lines.'

function normaliseSections(obj: Record<string, unknown>): PersistedSection[] | null {
  if (Array.isArray(obj.sections)) {
    return obj.sections as PersistedSection[]
  }
  if (
    Array.isArray(obj.patternLines) &&
    obj.patternLines.every((l): l is string => typeof l === 'string')
  ) {
    return [{ label: '', lines: [...(obj.patternLines as string[])] }]
  }
  return null
}

function validateSections(sections: unknown): { ok: boolean; shapeError: boolean } {
  if (!Array.isArray(sections) || sections.length === 0) {
    return { ok: false, shapeError: false }
  }

  let shapeError = false
  let anyLines = false
  for (const section of sections) {
    if (
      section === null ||
      typeof section !== 'object' ||
      typeof (section as Record<string, unknown>).label !== 'string' ||
      !Array.isArray((section as Record<string, unknown>).lines) ||
      !((section as Record<string, unknown>).lines as unknown[]).every(
        (l) => typeof l === 'string'
      )
    ) {
      shapeError = true
      continue
    }
    if (((section as Record<string, unknown>).lines as string[]).length > 0) {
      anyLines = true
    }
  }

  if (shapeError) return { ok: false, shapeError: true }
  if (!anyLines) return { ok: false, shapeError: false }
  return { ok: true, shapeError: false }
}

export function validatePattern(input: unknown): ValidationResult {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: ['Pattern must be a JSON object.'] }
  }

  const obj = input as Record<string, unknown>
  const errors: string[] = []

  const requiredStrings = ['projectName', 'yarnGauge', 'yarnColor', 'startDate'] as const
  for (const field of requiredStrings) {
    if (typeof obj[field] !== 'string' || (obj[field] as string).trim() === '') {
      errors.push(`Missing required field: ${field}`)
    }
  }

  const candidate = normaliseSections(obj)
  if (candidate === null) {
    errors.push(SECTIONS_MESSAGE)
  } else {
    const { ok, shapeError } = validateSections(candidate)
    if (!ok) {
      errors.push(shapeError ? SECTION_SHAPE_MESSAGE : SECTIONS_MESSAGE)
    }
  }

  if (!errors.some((e) => e.includes('startDate'))) {
    const dateStr = obj.startDate as string
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateStr) || isNaN(new Date(dateStr).getTime())) {
      errors.push('startDate must be a valid date (YYYY-MM-DD).')
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const sections = (candidate as PersistedSection[]).map((s) => ({
    label: s.label,
    lines: [...s.lines],
  }))

  return {
    ok: true,
    data: {
      projectName: obj.projectName as string,
      yarnName: typeof obj.yarnName === 'string' ? obj.yarnName : '',
      yarnGauge: obj.yarnGauge as string,
      yarnMaterial: typeof obj.yarnMaterial === 'string' ? obj.yarnMaterial : '',
      yarnColor: obj.yarnColor as string,
      hookSize: typeof obj.hookSize === 'string' ? obj.hookSize : '',
      startDate: obj.startDate as string,
      sections,
    },
  }
}
