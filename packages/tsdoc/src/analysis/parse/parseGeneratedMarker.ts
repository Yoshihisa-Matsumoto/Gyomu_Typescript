import { withOptional } from '@gyomu/schema'
import type { GeneratorMarker } from '@gyomu/schema/typescript'

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

export const extractGeneratorMarker = (text: string): string | undefined => {
  return text.match(/@GeneratedBy\([^)]+\)/)?.[0]
}
