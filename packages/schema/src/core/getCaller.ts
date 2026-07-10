export function getCaller(depth = 1): string {
  const stack = new Error().stack
  if (!stack) {
    return 'unknown'
  }

  const line = stack.split('\n')[depth + 2]
  if (!line) {
    return 'unknown'
  }

  const functionMatch = line.match(/at (.+?) \(/)
  if (functionMatch && functionMatch[1]) {
    return functionMatch[1]
  }

  const locationMatch = line.match(/at (.+)$/)
  if (locationMatch && locationMatch.length > 1 && locationMatch[1]) {
    // フルパスではなくファイル名:行:列だけ返す
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return locationMatch[1].replace(/\\/g, '/').split('/').slice(-1)[0]!
  }

  return 'anonymous'
}
