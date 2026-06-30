import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { prepareSymbolAnalysis } from '../prepareSymbolAnalysis.js'
import { detectEffectSignals } from '../analyzeEffectType.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeClassPropertyMember, analyzeGetSetAccessor } from './analyzeClassPropertyMember.js'
import { analyzeClassMethodMember } from './analyzeClassMethodMember.js'
import { analyzeConstructor } from './analyzeConstructor.js'
import type {
  DependencyRequirement,
  DocumentableMemberAnalysis,
  MemberAnalysis,
  SymbolAnalysis,
} from '@gyomu/schema/typescript'
import type { ClassDeclaration } from 'ts-morph'

import type { ChildAnalysisArg, GetSignatureIdArg, TagAnalysisArg } from '../../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeClass = (args: TagAnalysisArg<ClassDeclaration>) => {
  const {
    declaration,
    sourceRelativePath,
    metadata,
    memberPath,
    imported,
    options,
    sourceFullText,
  } = args
  const typeName = args.declaration.getName() ?? ''
  const prepared = prepareSymbolAnalysis(
    {
      declaration,
      sourceRelativePath,
      memberPath,
      metadata,
      nodeName: typeName,
      sourceFullText,
      imported,
      options,
    },
    getSignatureId,
  )
  const identity: SymbolIdentity = {
    symbolId: typeName,
    signatureId: prepared.signature.id,
  }
  const symbol = {
    id: prepared.id,
    signature: prepared.signature,
    snippet: prepared.snippet,
    kind: 'class',
    location: {
      startLine: args.declaration.getStartLineNumber(),
      endLine: args.declaration.getEndLineNumber(),
    },
    type: {
      text: typeName,
      source: 'typescript',
      ...withOptional({ effect: detectEffectSignals(typeName) }),
    },
    identity,
    startOffset: args.declaration.getStart(),
    ...withOptional({ jsDoc: prepared.jsDoc, parsedJsDoc: prepared.parsedJsDoc }),
    members: analyzeClassMembers({
      sourceRelativePath,
      metadata,
      node: declaration,
      ownerSymbolId: prepared.id,
      ownerSymbolIdentity: identity,
      memberPath: [],
      sourceFullText,
      imported,
      options,
      declarationOrder: 0,
    }),
    declarationOrder: args.declarationOrder,
    dependencyRequirements: new Array<DependencyRequirement>(),
  } satisfies SymbolAnalysis

  registerSymbolSymbolAnalysis(
    args.metadata,
    symbol,
    computeIndent(
      args.sourceFullText,
      args.declaration.getStart(),
      args.declaration.getStartLinePos(),
    ),
  )

  return {
    symbol,
    isDefault: args.declaration.isDefaultExport(),
    isExported: args.declaration.isExported(),
  }
}

const analyzeClassMembers = (args: ChildAnalysisArg<ClassDeclaration>): Array<MemberAnalysis> => {
  const {
    node,
    sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    sourceFullText,
    imported,
    options,
  } = args
  const nodeMembers = node.getMembers()

  const setters = nodeMembers.filter((v) => Node.isSetAccessorDeclaration(v))

  const members = nodeMembers.flatMap((member, index) => {
    if (Node.isPropertyDeclaration(member)) {
      return [
        analyzeClassPropertyMember({
          sourceRelativePath,
          metadata,
          node: member,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath,
          sourceFullText,
          declarationOrder: index,
          imported,
          options,
        }),
      ]
    }
    if (Node.isMethodDeclaration(member))
      return [
        analyzeClassMethodMember(
          {
            sourceRelativePath,
            metadata,
            node: member,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath,
            sourceFullText,
            declarationOrder: index,
            imported,
            options,
          },
          member.getName(),
          member,
        ),
      ]
    if (Node.isConstructorDeclaration(member))
      return analyzeConstructor(
        {
          sourceRelativePath,
          metadata,
          node: member,
          declarationOrder: index,
          memberPath,
          sourceFullText,
          ownerSymbolId,
          ownerSymbolIdentity,
          imported,
          options,
        },
        node,
      )

    if (Node.isGetAccessorDeclaration(member)) {
      const getter = member
      const name = getter.getName()
      const setter = setters.find((s) => s.getName() == name)
      const analysis = analyzeGetSetAccessor(
        {
          sourceRelativePath,
          metadata,
          node: getter,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath,
          sourceFullText,
          declarationOrder: index,
          imported,
          options,
        },
        setter,
      )
      return analysis
    }

    return [] as Array<DocumentableMemberAnalysis>
  })

  return members
}

const getSignatureId = (args: GetSignatureIdArg<ClassDeclaration>) => {
  return { id: 'class', parameters: [] }
}
