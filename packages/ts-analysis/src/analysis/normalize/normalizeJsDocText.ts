export const normalizeJsDocText = (value: string): string => {
  return value
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) =>
      line
        .replace(/^\s*\/\*\*\s?$/, '')
        .replace(/^\s*\*\/\s?$/, '')
        .replace(/^\s*\*\s?/, ''),
    )
    .join('\n')
    .trim()
}
