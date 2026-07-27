import { Node } from 'ts-morph'
import { extractJsDoc } from '../../extract/extractJsDoc.js'
import { registerSymbolJsDoc } from '../../file/registerSymbolJsDoc.js'
import { createSymbolIdentity } from '../../shared/createSymbolIdentity.js'
import type { SymbolId } from '@gyomu/schema/typescript'
import type { JSDocableNode } from 'ts-morph'
import type { GetSignatureIdArg } from '../types.js'
import type {
  DependencyCandidate,
  JsDocAnalysis,
  ParsedJsDoc,
  SignatureAnalysis,
} from '@gyomu/schema/schemas/typescript'

/**
 * Prepares and registers JSDoc analysis for a given symbol declaration.
 *
 * @param args Arguments required for signature identification.
 *
 * @param getSignature A callback to perform signature analysis.
 *
 * @param jsDocableNode Optional explicit JSDocable node.
 *
 * @returns The prepared symbol analysis data structure.
 */
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
  registerSymbolJsDoc(id, metadata, extractedJsDoc, options)

  if (extractedJsDoc?.analysis)
    return {
      id,
      jsDoc: extractedJsDoc.analysis,
      parsedJsDoc: extractedJsDoc.parsed,
      signature: signature,
      snippet: declaration.getText(),
      dependencyCandidates: signature.dependencyCandidates,
    } satisfies SymbolPreparation
  return { id, signature, snippet: declaration.getText() }
}

/**
 * Represents the prepared analysis data for a code symbol, including its identity, signature, and extracted documentation.
 */
export interface SymbolPreparation {
  /**
   * The unique identity of the symbol.
   */
  id: SymbolId

  /**
   * The parsed JSDoc analysis result, if available.
   */
  jsDoc?: JsDocAnalysis

  /**
   * The collection of parsed JSDoc segments.
   */
  parsedJsDoc?: Array<ParsedJsDoc>

  /**
   * The calculated signature analysis details.
   */
  signature: SignatureAnalysis

  /**
   * The original source code snippet for the symbol.
   */
  snippet: string

  /**
   * Optional collection of identified dependencies.
   */
  dependencyCandidates?: ReadonlyArray<DependencyCandidate> | undefined
}
