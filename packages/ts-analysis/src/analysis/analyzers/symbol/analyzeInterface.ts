import { Node, SyntaxKind } from 'ts-morph'
import { registerSymbolSymbolAnalysis } from '../../file/registerSymbolSymbolAnalysis.js'
import { prepareSymbolAnalysis } from './prepareSymbolAnalysis.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { detectEffectSignals } from './analyzeEffectType.js'
import { computeIndent } from './computeIndent.js'
import { analyzeGenericsParameters } from './analyzeGenericsParameters.js'
import { analyzeDependency } from './analyzeDependency.js'
import type { DependencyCandidate, MemberAnalysis, SymbolAnalysis } from '@gyomu/schema/typescript'
import type { InterfaceDeclaration } from 'ts-morph'
import type {
  ChildAnalysisArg,
  GetSignatureIdArg,
  MemberAnalysisResult,
  TagAnalysisArg,
} from '../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeInterface = (args: TagAnalysisArg<InterfaceDeclaration>) => {
  const {
    declaration,
    sourceRelativePath,
    metadata,
    memberPath,
    sourceFullText,
    imported,
    options,
  } = args
  const typeName = args.declaration.getName()
  const prepared = prepareSymbolAnalysis(
    {
      declaration,
      sourceRelativePath,
      metadata,
      memberPath,
      nodeName: typeName,
      sourceFullText,
      imported,
      options,
      reservedNames: [],
    },
    getSignature,
  )
  const identity: SymbolIdentity = {
    symbolId: typeName,
    signatureId: prepared.signature.id,
  }
  const genericsResult = analyzeGenericsParameters({
    node: declaration,
    sourceRelativePath,
    metadata,
    memberPath: [],
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
        const extendsClasses = heritage
          .getTypeNodes()
          .map((expression) => expression.getExpression().getText())
        return extendsClasses.map((name) => {
          const heritagePath = [...memberPath, '$extend', heritageIndex++]
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

  const membersResult = analyzeInterfaceMembers({
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
    kind: 'interface',
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
    members: membersResult.member,
    declarationOrder: args.declarationOrder,
    dependencyCandidates: [
      ...genericsResult.dependencies,
      ...heritages,
      ...membersResult.dependencies,
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

const getSignature = (args: GetSignatureIdArg<InterfaceDeclaration>) => {
  return { id: 'interface', parameters: [] }
}

const analyzeInterfaceMembers = (
  args: ChildAnalysisArg<InterfaceDeclaration>,
): MemberAnalysisResult<Array<MemberAnalysis>> => {
  const {
    node,
    sourceRelativePath,
    metadata,
    memberPath,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    imported,
    options,
    reservedNames,
  } = args
  const newMemberPath = [...memberPath, '$member']
  const members = node
    .getMembers()
    .flatMap<MemberAnalysisResult<MemberAnalysis> | undefined>((member, index) => {
      if (Node.isPropertySignature(member)) {
        const typeNode = member.getTypeNode()
        if (Node.isFunctionTypeNode(typeNode)) {
          return analyzeFunctionMember(
            {
              sourceRelativePath,
              metadata,
              node: typeNode,
              ownerSymbolId,
              ownerSymbolIdentity,
              memberPath: newMemberPath,
              sourceFullText,
              declarationOrder: index,
              imported,
              options,
              reservedNames,
            },
            {
              isStatic: undefined,
              visibility: undefined,
              name: member.getName(),
              jsDocableNode: member,
            },
          ) satisfies MemberAnalysisResult<MemberAnalysis>
        }
        // console.log(`PromPmember, ${index}`)
        return analyzePropertyMember({
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
        }) satisfies MemberAnalysisResult<MemberAnalysis>
      }

      if (Node.isMethodSignature(member)) {
        return analyzeFunctionMember(
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
          {
            isStatic: undefined,
            visibility: undefined,
            name: member.getName(),
            jsDocableNode: member,
          },
        ) satisfies MemberAnalysisResult<MemberAnalysis>
      }

      return undefined
    })
    .filter((m) => !!m)

  return {
    member: members.map((m) => m.member),
    dependencies: members.map((m) => m.dependencies).flat(),
  }
}
