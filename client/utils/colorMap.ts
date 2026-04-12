const COLOR_MAP: Record<string, string> = {
  red: '#e53e3e',
  blue: '#3182ce',
  black: '#1a202c',
  white: '#f7fafc',
  green: '#38a169',
  pink: '#d53f8c',
  purple: '#805ad5',
  orange: '#dd6b20',
  yellow: '#d69e2e',
  teal: '#319795',
  gray: '#a0aec0',
  grey: '#a0aec0',
  brown: '#8b6914',
  cream: '#f6f0e4',
  navy: '#1a365d',
  coral: '#e8735a',
  maroon: '#822727',
  beige: '#e8dcc8',
}

const FALLBACK = '#a0aec0'

export function yarnColorToCss(colorName: string): string {
  return COLOR_MAP[colorName.toLowerCase().trim()] ?? FALLBACK
}
