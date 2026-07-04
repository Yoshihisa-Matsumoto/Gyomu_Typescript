import { Node, SyntaxKind } from 'ts-morph'
import { SignatureId, SymbolId } from '@gyomu/schema/typescript'
import { prepareSymbolAnalysis } from '../prepareSymbolAnalysis.js'
import { detectEffectSignals } from '../analyzeEffectType.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeDependency } from '../analyzeDependency.js'
import { analyzeGenericsParameters } from '../analyzeGenericsParameters.js'
import { analyzeClassPropertyMember, analyzeGetSetAccessor } from './analyzeClassPropertyMember.js'
import { analyzeClassMethodMember } from './analyzeClassMethodMember.js'
import { analyzeConstructor } from './analyzeConstructor.js'
import type { MemberAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { ClassDeclaration } from 'ts-morph'

import type {
  ChildAnalysisArg,
  GetSignatureIdArg,
  MemberAnalysisResult,
  TagAnalysisArg,
} from '../../types.js'
import type { DependencyCandidate, SymbolIdentity } from '@gyomu/schema/schemas/typescript'

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
      reservedNames: [],
    },
    getSignatureId,
  )
  const identity: SymbolIdentity = {
    symbolId: SymbolId(typeName),
    signatureId: prepared.signature.id,
  }
  const genericsResult = analyzeGenericsParameters({
    node: declaration,
    sourceRelativePath,
    metadata,
    memberPath,
    ownerSymbolId: prepared.id,
    ownerSymbolIdentity: identity,
    sourceFullText,
    declarationOrder: 0,
    imported,
    options,
    reservedNames: [],
  })

  let heritageIndex = 0
  const heritages: Array<DependencyCandidate> = declaration
    .getHeritageClauses()
    .map((heritage) => {
      const keyword = heritage.getToken()

      if (keyword == SyntaxKind.ExtendsKeyword) {
        const heritagePath = [...memberPath, '$extend', heritageIndex++]
        const extendsClasses = heritage
          .getTypeNodes()
          .map((expression) => expression.getExpression().getText())
        return extendsClasses.map((name) => {
          return analyzeDependency(name, imported, heritagePath)
        })
      } else {
        const implementTypes = heritage
          .getTypeNodes()
          .map((expression) => expression.getExpression().getText())
        return implementTypes.map((name) => {
          const heritagePath = [...memberPath, '$implement', heritageIndex++]
          return analyzeDependency(name, imported, heritagePath)
        })
      }
    })
    .flat()

  const memberResult = analyzeClassMembers({
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
    reservedNames: genericsResult.parameters,
  })
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
      effect: detectEffectSignals(typeName),
    },
    identity,
    startOffset: args.declaration.getStart(),
    jsDoc: prepared.jsDoc,
    parsedJsDoc: prepared.parsedJsDoc,
    members: memberResult.member,
    declarationOrder: args.declarationOrder,
    dependencyCandidates: [
      ...heritages,
      ...memberResult.dependencies,
      ...genericsResult.dependencies,
    ],
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

const analyzeClassMembers = (
  args: ChildAnalysisArg<ClassDeclaration>,
): MemberAnalysisResult<Array<MemberAnalysis>> => {
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
    reservedNames,
  } = args
  const nodeMembers = node.getMembers()

  const setters = nodeMembers.filter((v) => Node.isSetAccessorDeclaration(v))

  const members = nodeMembers
    .flatMap<MemberAnalysisResult<Array<MemberAnalysis>> | undefined>((member, index) => {
      if (Node.isPropertyDeclaration(member)) {
        const newMemberPath = [...memberPath, '$member']
        const propertyResult = analyzeClassPropertyMember({
          sourceRelativePath,
          metadata,
          node: member,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath: newMemberPath,
          sourceFullText,
          declarationOrder: index,
          imported,
          options,
          reservedNames,
        })
        return {
          member: [propertyResult.member] as Array<MemberAnalysis>,
          dependencies: propertyResult.dependencies,
        } satisfies MemberAnalysisResult<Array<MemberAnalysis>>
      }
      if (Node.isMethodDeclaration(member)) {
        const newMemberPath = [...memberPath]
        const methodResult = analyzeClassMethodMember(
          {
            sourceRelativePath,
            metadata,
            node: member,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath: newMemberPath,
            sourceFullText,
            declarationOrder: index,
            imported,
            options,
            reservedNames,
          },
          member.getName(),
          member,
        )
        return {
          member: [methodResult.member] as Array<MemberAnalysis>,
          dependencies: methodResult.dependencies,
        } satisfies MemberAnalysisResult<Array<MemberAnalysis>>
      }
      if (Node.isConstructorDeclaration(member)) {
        const name = '$constructor'
        const newMemberPath = [...memberPath]
        return analyzeConstructor(
          {
            sourceRelativePath,
            metadata,
            node: member,
            declarationOrder: index,
            memberPath: newMemberPath,
            sourceFullText,
            ownerSymbolId,
            ownerSymbolIdentity,
            imported,
            options,
            reservedNames,
          },
          node,
          name,
        ) satisfies MemberAnalysisResult<Array<MemberAnalysis>>
      }
      if (Node.isGetAccessorDeclaration(member)) {
        const getter = member
        const name = getter.getName()
        const setter = setters.find((s) => s.getName() == name)
        const newMemberPath = [...memberPath, '$member']
        const analysis = analyzeGetSetAccessor(
          {
            sourceRelativePath,
            metadata,
            node: getter,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath: newMemberPath,
            sourceFullText,
            declarationOrder: index,
            imported,
            options,
            reservedNames,
          },
          setter,
        )
        return { member: [analysis.member], dependencies: analysis.dependencies }
      }

      return undefined
    })
    .filter((m) => !!m)

  return {
    member: members.map((m) => m.member).flat(),
    dependencies: members.map((m) => m.dependencies).flat(),
  }
}

const getSignatureId = (args: GetSignatureIdArg<ClassDeclaration>) => {
  return { id: SignatureId('class'), parameters: [] }
}
