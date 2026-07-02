import { Node } from 'ts-morph'
import { extractJsDoc } from '../../extract/extractJsDoc.js'
import { registerSymbolJsDoc } from '../../file/registerSymbolJsDoc.js'
import { createSymbolIdentity } from '../../shared/createSymbolIdentity.js'
import type {
  DependencyCandidate,
  JsDocAnalysis,
  ParsedJsDoc,
  SignatureAnalysis,
  SymbolId,
} from '@gyomu/schema/typescript'
import type { JSDocableNode } from 'ts-morph'
import type { GetSignatureIdArg } from '../types.js'

export const prepareSymbolAnalysis = <T extends Node>(
  args: GetSignatureIdArg<T>,
  getSignature: (args: GetSignatureIdArg<T>, jsDocableNode?: JSDocableNode) => SignatureAnalysis,
  jsDocableNode?: JSDocableNode,
): SymbolPreparation => {
  const {
    declaration,
    sourceRelativePath,
    metadata,
    nodeName,
    memberPath,
    sourceFullText,
    imported,
    options,
    reservedNames,
  } = args
  const signature = getSignature(
    {
      declaration,
      sourceRelativePath,
      metadata,
      memberPath,
      nodeName,
      sourceFullText,
      imported,
      options,
      reservedNames,
    },
    jsDocableNode,
  )
  const id = createSymbolIdentity(declaration, sourceRelativePath, signature.id).id

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
      dependencyCandidates: signature.dependencyCandidates,
    }
  return { id, signature, snippet: declaration.getText() }
}
export interface SymbolPreparation {
  id: SymbolId
  jsDoc?: JsDocAnalysis
  parsedJsDoc?: Array<ParsedJsDoc>
  signature: SignatureAnalysis
  snippet: string
  dependencyCandidates?: ReadonlyArray<DependencyCandidate> | undefined
}
