import { normalizeJsDocText } from '../normalize/normalizeJsDocText.js'
import type { ProtectedRegion } from '@gyomu/schema/schemas/typescript'

const START_MARKER = '<!-- tsdoc-preserve-start -->'
const END_MARKER = '<!-- tsdoc-preserve-end -->'

/**
 * Parses a string for protected code regions delimited by predefined start and end markers, returning an array of identified regions.
 *
 * @param text The input text to parse.
 *
 * @returns An array of identified ProtectedRegion objects.
 */
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
