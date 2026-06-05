import { withOptional } from '@gyomu/schema'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import type { FunctionDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../types.js'
import type { SignatureAnalysis } from '../../symbol/SymbolModel.js'

export const analyzeFunctionDeclaration = (args: JSDocableTagAnalysisArg<FunctionDeclaration>) => {
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    getFunctionSignatureId,
  )

  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'function',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    identity: {
      symbolId: args.name ?? args.declaration.getName() ?? '',
      signatureId: prepared.signature.id,
    },
    startOffset: args.declaration.getStart(),
    ...withOptional({ jsDoc: prepared.jsDoc }),
    members: [],
  } satisfies SymbolAnalysis
  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}
const normalizeTypeText = (text: string): string => text.replace(/import\([^)]*\)\./g, '')
const getFunctionSignatureId = (declaration: FunctionDeclaration): SignatureAnalysis => {
  const typeParams = declaration
    .getTypeParameters()
    .map((tp) => tp.getText())
    .join(',')
  const params = declaration
    .getParameters()
    .map((p) => {
      const type = normalizeTypeText(p.getType().getText(declaration))

      return `${p.getName()}:${type}`
    })
    .join(',')

  const returnType = normalizeTypeText(declaration.getReturnType().getText(declaration))

  const overloadCount = declaration.getOverloads().length
  let isOverloadImplementation = false
  if (overloadCount > 0 && !declaration.isOverload()) {
    isOverloadImplementation = true
  }
  return {
    id: `${typeParams ? '(' + typeParams + ')' : ''}(${params}):${returnType}`,
    parameters: [],
    overloadCount: declaration.getOverloads().length,
    isOverloadImplementation,
  }
}
