export const computeIndent = (sourceFullText: string, startPos: number, lineStart: number) => {
  console.log({ startPos, lineStart })
  // return sourceFullText.slice(lineStart, startPos)
  const lineText = sourceFullText.slice(lineStart, sourceFullText.indexOf('\n', lineStart))
  if (lineStart == 221) {
    console.log(lineText)
  }
  return lineText.match(/^\s*/)?.[0] ?? ''
}
