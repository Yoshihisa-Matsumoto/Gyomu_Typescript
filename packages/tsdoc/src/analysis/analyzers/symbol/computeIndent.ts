export const computeIndent = (sourceFullText: string, startPos: number, lineStart: number) => {
  return sourceFullText.slice(lineStart, startPos)
}
