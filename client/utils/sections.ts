export interface Section {
  id: string
  label: string
  lines: string[]
}

export interface PersistedSection {
  label: string
  lines: string[]
}

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
}

export function makeSection(init: { label?: string; lines?: string[] } = {}): Section {
  return {
    id: newId(),
    label: init.label ?? '',
    lines: init.lines ?? [],
  }
}

export function migratePatternLines(patternLines: string[]): Section[] {
  return [makeSection({ label: '', lines: [...patternLines] })]
}

export function stripSectionIds(sections: Section[]): PersistedSection[] {
  return sections.map(({ label, lines }) => ({ label, lines: [...lines] }))
}
