import { parseJsDocStructure } from '../parse/parseJsDocStructure.js'
import { analyzeJsDoc } from '../analyzers/analyzeJsDoc.js'
import { extractRawJsDoc } from './extractRawJsDoc.js'
import type { JSDocableNode } from 'ts-morph'
import type { ExtractedJsDoc } from '../jsdoc/ExtractedJsDoc.js'

export const extractJsDoc = (node: JSDocableNode): ExtractedJsDoc | undefined => {
  const rawDocs = extractRawJsDoc(node)

  if (rawDocs.length === 0) {
    return undefined
  }

  const parsed = rawDocs.map(({ raw, doc }) => {
    return parseJsDocStructure(raw, doc)
  })

  const analysis = analyzeJsDoc(parsed)

  return {
    analysis: analysis,
    parsed,
  }
}
