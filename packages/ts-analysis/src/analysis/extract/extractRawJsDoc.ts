import type { JSDoc, JSDocableNode } from 'ts-morph'
import type { RawJsDoc } from '@gyomu/schema/schemas/typescript'

/**
 * Extracts raw JSDoc information and the corresponding JSDoc object from a given JSDocableNode.
 *
 * @param node The node from which to extract JSDoc content.
 *
 * @returns An array of objects, each containing the raw location and text information along with the original JSDoc node.
 */
export const extractRawJsDoc = (node: JSDocableNode): Array<{ raw: RawJsDoc; doc: JSDoc }> => {
  const jsDocs = node.getJsDocs()
  return jsDocs.map((doc) => {
    return {
      raw: {
        location: {
          startLine: doc.getStartLineNumber(),
          endLine: doc.getEndLineNumber(),
        },
        rawText: doc.getInnerText(),
      },
      doc,
    }
  })
}
