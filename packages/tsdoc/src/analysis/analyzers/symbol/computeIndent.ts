export const computeIndent = (sourceFullText: string, startPos: number, lineStart: number) => {
  // console.log({ sourceFullText, startPos, lineStart })
  // return sourceFullText.slice(lineStart, startPos)
  const lineText = sourceFullText.slice(lineStart, sourceFullText.indexOf('\n', lineStart))
  return lineText.match(/^\s*/)?.[0] ?? ''
}
