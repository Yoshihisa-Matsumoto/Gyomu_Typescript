import { normalizeJsDocText } from '../normalize/normalizeJsDocText.js'
import type { ProtectedRegion } from '../jsdoc/ParsedJsDoc.js'

const START_MARKER = '<!-- tsdoc-preserve-start -->'
const END_MARKER = '<!-- tsdoc-preserve-end -->'

export const parseProtectedRegions = (text: string): Array<ProtectedRegion> => {
  const regions: Array<ProtectedRegion> = []

  let cursor = 0

  while (cursor < text.length) {
    const start = text.indexOf(START_MARKER, cursor)

    if (start === -1) {
      break
    }
    const end = text.indexOf(END_MARKER, start + START_MARKER.length)
    if (end === -1) break

    const contentStart = start + START_MARKER.length

    const rawContent = text.slice(contentStart, end).trim()
    const content = normalizeJsDocText(rawContent)

    regions.push({
      start,
      end: end + END_MARKER.length,
      content,
    })
    cursor = end + END_MARKER.length
  }

  return regions
}
