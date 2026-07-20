import { renderJsDocLines } from './internal/renderJsDocLines.js'
import { renderJsDocString } from './internal/renderJsDocString.js'
import type { UpdatedSymbolJsDoc } from './jsDoc/UpdatedSymbolJsDoc.js'
import type { RenderedSymbolJsDoc } from './jsDoc/RenderedSymbolJsDoc.js'

export const renderJsDoc = (updated: UpdatedSymbolJsDoc): RenderedSymbolJsDoc => {
  const lines = renderJsDocLines(updated)
  const document = renderJsDocString(
    lines,
    updated.jsDoc.startOffset == updated.jsDoc.endOffset,
    updated.indent,
  )
  const isAdded = updated.jsDoc.startOffset == updated.jsDoc.endOffset

  return {
    target: updated.target,
    jsDoc: document,
    startOffset: updated.jsDoc.startOffset - updated.indent.length,
    endOffset: isAdded ? updated.jsDoc.endOffset - updated.indent.length : updated.jsDoc.endOffset,
    indent: updated.indent.length,
  }
}

export const renderJsDocs = (
  updatedList: ReadonlyArray<UpdatedSymbolJsDoc>,
): Array<RenderedSymbolJsDoc> => {
  return updatedList.map((updated) => renderJsDoc(updated))
}
