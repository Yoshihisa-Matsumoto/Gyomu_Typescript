import { Node } from 'ts-morph'
import { extractJsDoc } from '../../extract/extractJsDoc.js'
import { registerSymbolJsDoc } from '../../file/registerSymbolJsDoc.js'
import { createSymbolIdentity } from '../../shared/createSymbolIdentity.js'
import type {
  JsDocAnalysis,
  MemberIdentityMemberPath,
  ParsedJsDoc,
  ProjectRelativePath,
  SignatureAnalysis,
  SymbolId,
} from '@gyomu/schema/typescript'
import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'
import type { JSDocableNode } from 'ts-morph'

export const prepareSymbolAnalysis = <T extends Node>(
  declaration: T,
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  memberPath: MemberIdentityMemberPath,
  getSignature: (
    declaration: T,
    sourcePath: ProjectRelativePath,
    metadata: FileAnalysisMetadata,
    memberPath: MemberIdentityMemberPath,
    nodeName: string,
    sourceFullText: string,
  ) => SignatureAnalysis,
  nodeName: string,
  sourceFullText: string,
  jsDocableNode?: JSDocableNode,
): SymbolPreparation => {
  const signature = getSignature(
    declaration,
    sourcePath,
    metadata,
    memberPath,
    nodeName,
    sourceFullText,
  )
  const id = createSymbolIdentity(declaration, sourcePath, signature.id).id

  if (!jsDocableNode && !Node.isJSDocable(declaration))
    return { id, signature, snippet: declaration.getText() }
  const checkJsDockableNode = jsDocableNode ?? (declaration as unknown as JSDocableNode)

  const extractedJsDoc = extractJsDoc(checkJsDockableNode)
  registerSymbolJsDoc(id, metadata, extractedJsDoc)

  if (extractedJsDoc?.analysis)
    return {
      id,
      jsDoc: extractedJsDoc.analysis,
      parsedJsDoc: extractedJsDoc.parsed,
      signature: signature,
      snippet: declaration.getText(),
    }
  return { id, signature, snippet: declaration.getText() }
}
export interface SymbolPreparation {
  id: SymbolId
  jsDoc?: JsDocAnalysis
  parsedJsDoc?: Array<ParsedJsDoc>
  signature: SignatureAnalysis
  snippet: string
}
