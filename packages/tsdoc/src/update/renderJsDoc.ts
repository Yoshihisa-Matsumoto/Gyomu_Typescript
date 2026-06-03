import { renderJsDocLines } from './internal/renderJsDocLines.js'
import { renderJsDocString } from './internal/renderJsDocString.js'
import type { UpdatedSymbolJsDoc } from './jsdoc/UpdatedSymbolJsDoc.js'
import type { RenderedSymbolJsDoc } from './jsdoc/RenderedSymbolJsDoc.js'

export const renderJsDoc = (updated: UpdatedSymbolJsDoc): RenderedSymbolJsDoc => {
  const lines = renderJsDocLines(updated)
  const document = renderJsDocString(lines)
  return {
    target: updated.target,
    jsDoc: document,
    startOffset: updated.jsDoc.startOffset,
    endOffset: updated.jsDoc.endOffset,
  }
}

export const renderJsDocs = (
  updatedList: ReadonlyArray<UpdatedSymbolJsDoc>,
): Array<RenderedSymbolJsDoc> => {
  return updatedList.map((updated) => renderJsDoc(updated))
}
