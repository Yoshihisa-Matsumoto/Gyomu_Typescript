import type { JSDoc, JSDocableNode } from 'ts-morph'
import type { RawJsDoc } from '../jsdoc/RawJsDoc.js'

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
