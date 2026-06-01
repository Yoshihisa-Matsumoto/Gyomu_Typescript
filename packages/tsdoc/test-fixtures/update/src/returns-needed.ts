export function buildDisplayName(firstName: string, lastName: string, nickname?: string): string {
  const name = `${firstName} ${lastName}`

  return nickname ? `${name} (${nickname})` : name
}
