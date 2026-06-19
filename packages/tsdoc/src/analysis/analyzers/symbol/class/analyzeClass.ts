import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { prepareSymbolAnalysis } from '../prepareSymbolAnalysis.js'
import { detectEffectSignals } from '../analyzeEffectType.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeClassPropertyMember, analyzeGetSetAccessor } from './analyzeClassPropertyMember.js'
import { analyzeClassMethodMember } from './analyzeClassMethodMember.js'
import { analyzeConstructor } from './analyzeConstructor.js'
import type { ProjectRelativePath } from '../../../types.js'
import type {
  DocumentableMemberAnalysis,
  MemberAnalysis,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
} from '@gyomu/schema/typescript'
import type { ClassDeclaration } from 'ts-morph'
import type { SymbolAnalysis } from '../../../symbol/SymbolAnalysis.js'
import type { JSDocableTagAnalysisArg } from '../../types.js'
import type { FileAnalysisMetadata } from '../../../file/FileAnalysisResult.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeClassDeclaration = (args: JSDocableTagAnalysisArg<ClassDeclaration>) => {
  const typeName = args.name ?? args.declaration.getName() ?? ''
  const prepared = prepareSymbolAnalysis(
    args.declaration,
    args.sourceRelativePath,
    args.metadata,
    args.memberPath,
    getSignatureId,
    typeName,
    args.sourceFullText,
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
    members: analyzeClassMembers(
      args.sourceRelativePath,
      args.metadata,
      args.declaration,
      prepared.id,
      identity,
      [],
      args.sourceFullText,
    ),
    declarationOrder: args.declarationOrder,
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
  }
}

const analyzeClassMembers = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  node: ClassDeclaration,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  sourceFullText: string,
): Array<MemberAnalysis> => {
  const nodeMembers = node.getMembers()

  const setters = nodeMembers.filter((v) => Node.isSetAccessorDeclaration(v))

  const members = nodeMembers.flatMap((member, index) => {
    if (Node.isPropertyDeclaration(member)) {
      return [
        analyzeClassPropertyMember({
          sourcePath,
          metadata,
          node: member,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath,
          sourceFullText,
          declarationOrder: index,
        }),
      ]
    }
    if (Node.isMethodDeclaration(member))
      return [
        analyzeClassMethodMember({
          sourcePath,
          metadata,
          node: member,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath,
          name: member.getName(),
          jsDocableNode: member,
          sourceFullText,
          declarationOrder: index,
        }),
      ]
    if (Node.isConstructorDeclaration(member))
      return analyzeConstructor(
        sourcePath,
        metadata,
        member,
        node,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        sourceFullText,
        index,
      )

    if (Node.isGetAccessorDeclaration(member)) {
      const getter = member
      const name = getter.getName()
      const setter = setters.find((s) => s.getName() == name)
      const analysis = analyzeGetSetAccessor(
        {
          sourcePath,
          metadata,
          node: getter,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath,
          sourceFullText,
          declarationOrder: index,
        },
        setter,
      )
      return analysis
    }

    return [] as Array<DocumentableMemberAnalysis>
  })

  // const getters = nodeMembers.filter((v) => Node.isGetAccessorDeclaration(v))

  // const getterAnalysis: Array<DocumentablePropertyMemberAnalysis> = []
  // for (const getter of getters) {
  //   const name = getter.getName()
  //   const setter = setters.find((s) => s.getName() == name)
  //   const analysis = analyzeGetSetAccessor(
  //     {
  //       sourcePath,
  //       metadata,
  //       node: getter,
  //       ownerSymbolId,
  //       ownerSymbolIdentity,
  //       memberPath,
  //       sourceFullText,
  //     },
  //     setter,
  //   )
  //   getterAnalysis.push(analysis)
  // }
  // members.push(...getterAnalysis)
  return members
}

const getSignatureId = (declaration: ClassDeclaration) => {
  return { id: 'class', parameters: [] }
}
