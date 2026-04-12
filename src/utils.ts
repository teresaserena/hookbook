function formatTimestamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `-${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`
  )
}

function sanitizeName(projectName: string): string {
  return projectName
    .trim()
    .replace(/[^a-z0-9\-_ ]/gi, '')
    .replace(/\s+/g, '-')
}

export function generatePatternId(projectName: string): string {
  const safeName = sanitizeName(projectName)
  return `${safeName}_${formatTimestamp(new Date())}`
}

export function generateVersionFilename(): string {
  const now = new Date()
  const ms = String(now.getUTCMilliseconds()).padStart(3, '0')
  return `v_${formatTimestamp(now)}-${ms}.json`
}
