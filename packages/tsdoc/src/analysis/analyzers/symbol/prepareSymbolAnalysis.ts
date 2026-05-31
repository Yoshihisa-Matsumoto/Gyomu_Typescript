import { Node } from 'ts-morph'
import { extractJsDoc } from '../../extract/extractJsDoc.js'
import { registerSymbolJsDoc } from '../../file/registerSymbolJsDoc.js'
import { createSymbolIdentity } from '../../shared/createSymbolIdentity.js'
import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'
import type { JSDocableNode } from 'ts-morph'
import type { ProjectRelativePath, SymbolId } from '../../types.js'
import type { JsDocAnalysis } from '../../jsdoc/JsDocAnalysis.js'

export const prepareSymbolAnalysis = (
  declaration: Node,
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  jsDocableNode?: JSDocableNode,
): SymbolPreparation => {
  const id = createSymbolIdentity(declaration, sourcePath).id

  if (!jsDocableNode && !Node.isJSDocable(declaration)) return { id }
  const checkJsDockableNode = jsDocableNode ?? (declaration as unknown as JSDocableNode)

  const extractedJsDoc = extractJsDoc(checkJsDockableNode)
  registerSymbolJsDoc(id, metadata, extractedJsDoc)

  if (extractedJsDoc?.analysis)
    return {
      id,
      jsDoc: extractedJsDoc.analysis,
    }
  return { id }
}
export interface SymbolPreparation {
  id: SymbolId
  jsDoc?: JsDocAnalysis
}
