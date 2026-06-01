export function buildDisplayName(firstName: string, lastName: string, nickname?: string): string {
  const base = `${firstName} ${lastName}`

  if (nickname == null || nickname.length === 0) {
    return base
  }

  return `${base} (${nickname})`
}
