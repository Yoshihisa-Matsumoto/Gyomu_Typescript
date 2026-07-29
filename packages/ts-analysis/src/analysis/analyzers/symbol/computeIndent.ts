/**
 * Computes the indentation string of the line containing the specified start position.
 *
 * @param sourceFullText The full source code text.
 *
 * @param startPos The position within the source text to evaluate.
 *
 * @param lineStart The starting index of the line.
 *
 * @returns The leading whitespace string of the line.
 */
export const computeIndent = (sourceFullText: string, startPos: number, lineStart: number) => {
  // console.log({ startPos, lineStart })
  // return sourceFullText.slice(lineStart, startPos)
  const lineText = sourceFullText.slice(lineStart, sourceFullText.indexOf('\n', lineStart))

  return lineText.match(/^\s*/)?.[0] ?? ''
}
