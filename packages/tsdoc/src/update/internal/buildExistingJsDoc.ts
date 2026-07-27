import { withOptional } from '@gyomu/schema'
import type { ExistingJsDoc } from '@gyomu/ai-compiler/jsdoc-update'
import type { JsDocAnalysis, ParsedJsDoc } from '@gyomu/schema/schemas/typescript'

/**
 * Constructs an ExistingJsDoc object from the provided JSDoc analysis and parsed JSDoc data.
 *
 * @param jsDocAnalysis The JSDoc analysis result.
 *
 * @param parsedJsDoc The parsed JSDoc structure.
 *
 * @returns An object representing the existing JSDoc documentation, or undefined if either input is missing.
 */
export const buildExistingJsDoc = (
  jsDocAnalysis: JsDocAnalysis | undefined,
  parsedJsDoc: ParsedJsDoc | undefined,
): ExistingJsDoc | undefined => {
  if (!jsDocAnalysis || !parsedJsDoc) {
    return undefined
  } else {
    return {
      ...withOptional({ summary: parsedJsDoc.summary, returns: parsedJsDoc.returns?.description }),
      params: parsedJsDoc.params.map((p) => ({
        name: p.name,
        sortOrder: p.sortOrder,
        ...withOptional({
          type: p.type,
          description: p.description,
        }),
      })),
      tags: parsedJsDoc.tags
        .filter((f) => ['param', 'return'].includes(f.tagName) == false)
        .map((t) => ({
          tag: t.tagName,
          content: t.text ?? '',
          sortOrder: t.sortOrder,
        })),
    }
  }
}
