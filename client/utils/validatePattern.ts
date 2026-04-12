export interface PatternData {
  projectName: string
  yarnName: string
  yarnGauge: string
  yarnMaterial: string
  yarnColor: string
  startDate: string
  patternLines: string[]
}

type ValidationResult =
  | { ok: true; data: PatternData }
  | { ok: false; errors: string[] }

export function validatePattern(input: unknown): ValidationResult {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, errors: ['Pattern must be a JSON object.'] }
  }

  const obj = input as Record<string, unknown>
  const errors: string[] = []

  const requiredStrings = ['projectName', 'yarnGauge', 'yarnColor', 'startDate'] as const
  for (const field of requiredStrings) {
    if (typeof obj[field] !== 'string' || obj[field].trim() === '') {
      errors.push(`Missing required field: ${field}`)
    }
  }

  if (
    !Array.isArray(obj.patternLines) ||
    obj.patternLines.length === 0 ||
    !obj.patternLines.every((line): line is string => typeof line === 'string')
  ) {
    errors.push('patternLines must be a non-empty array of strings. Example: ["ch3 2 sc", "rep"].')
  }

  // Validate startDate format only if it passed the required-string check
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

  return {
    ok: true,
    data: {
      projectName: obj.projectName as string,
      yarnName: typeof obj.yarnName === 'string' ? obj.yarnName : '',
      yarnGauge: obj.yarnGauge as string,
      yarnMaterial: typeof obj.yarnMaterial === 'string' ? obj.yarnMaterial : '',
      yarnColor: obj.yarnColor as string,
      startDate: obj.startDate as string,
      patternLines: obj.patternLines as string[],
    },
  }
}
