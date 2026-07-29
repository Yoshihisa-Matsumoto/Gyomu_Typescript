import { withOptional } from '@gyomu/schema'
import type { GeneratorMarker } from '@gyomu/schema/schemas/typescript'

/**
 * Parses a generator marker string to extract the tool name and optional version.
 *
 * @param text The input text containing the generator marker.
 *
 * @returns The parsed GeneratorMarker object if found, otherwise undefined.
 */
export const parseGeneratedMarker = (text: string): GeneratorMarker | undefined => {
  const marker = extractGeneratorMarker(text)
  if (!marker) return undefined

  const match = marker.match(/^@GeneratedBy\(([A-Za-z0-9._-]+)(?:@([A-Za-z0-9._-]+))?\)$/)

  if (!match || match.length < 2) return undefined

  const tool = match[1]
  if (!tool) return undefined

  return {
    tool,
    ...withOptional({ version: match[2] }),
    raw: match[0],
  }
}

/**
 * Extracts the generator marker substring from the provided text.
 *
 * @param text The source text to search for the marker.
 *
 * @returns The found generator marker string, if any.
 */
export const extractGeneratorMarker = (text: string): string | undefined => {
  return text.match(/@GeneratedBy\([^)]+\)/)?.[0]
}
