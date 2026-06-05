import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { prepareSymbolAnalysis } from '../prepareSymbolAnalysis.js'
import { analyzeGetSetAccessor, analyzePropertyMember } from './analyzePropertyMember.js'
import { analyzeMethodMember } from './analyzeMethodMember.js'
import { analyzeConstructor } from './analyzeConstructor.js'
import type { MemberAnalysis } from '../../../symbol/MemberAnalysis.js'
import type { ClassDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../../types.js'

export const analyzeClassDeclaration = (args: JSDocableTagAnalysisArg<ClassDeclaration>) => {
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    getSignatureId,
  )
  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'class',
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
    members: analyzeClassMembers(args.declaration),
  } satisfies SymbolAnalysis
  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
  }
}

const analyzeClassMembers = (node: ClassDeclaration): Array<MemberAnalysis> => {
  const nodeMembers = node.getMembers()
  const members = nodeMembers.flatMap((member) => {
    if (Node.isPropertyDeclaration(member)) {
      return [analyzePropertyMember(member)]
    }
    if (Node.isMethodDeclaration(member)) return [analyzeMethodMember(member)]
    if (Node.isConstructorDeclaration(member)) return analyzeConstructor(member, node)

    return [] as Array<MemberAnalysis>
  })

  const getters = nodeMembers.filter((v) => Node.isGetAccessorDeclaration(v))
  const setters = nodeMembers.filter((v) => Node.isSetAccessorDeclaration(v))
  const getterAnalysis: Array<MemberAnalysis> = []
  for (const getter of getters) {
    const name = getter.getName()
    const setter = setters.find((s) => s.getName() == name)
    const analysis = analyzeGetSetAccessor(getter, setter)
    getterAnalysis.push(analysis)
  }
  members.push(...getterAnalysis)
  return members
}

const getSignatureId = (declaration: ClassDeclaration) => {
  return { id: 'class', parameters: [] }
}
