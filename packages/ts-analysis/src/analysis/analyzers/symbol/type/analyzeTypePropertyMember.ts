import { Node } from 'ts-morph'
import { preparePropertyAnalysis } from '../prepareMemberAnalysis.js'
import { analyzeGenericsParameters } from '../analyzeGenericsParameters.js'
import { computeIndent } from '../computeIndent.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { analyzeType } from './analyzeType.js'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../types.js'
import type {
  Expression,
  GetAccessorDeclaration,
  PropertyDeclaration,
  PropertySignature,
  TypeNode,
} from 'ts-morph'

import type { SymbolId } from '@gyomu/schema/typescript'
import type {
  DependencyCandidate,
  DocumentableTypeProperty,
  JsDocAnalysis,
  MemberAccessor,
  ParsedJsDoc,
  SymbolIdentity,
  TypeProperty,
} from '@gyomu/schema/schemas/typescript'

export const analyzeTypePropertyMember = (
  args: ChildAnalysisArg<PropertySignature | PropertyDeclaration>,
  isStatic: boolean = false,
  visibility: MemberAccessor = 'public',
): MemberAnalysisResult<TypeProperty> => {
  const { sourceRelativePath, metadata, node, ownerSymbolId, ownerSymbolIdentity, memberPath } =
    args
  const typeNode = args.node.getTypeNode()
  const name = node.getName()
  const initializer = args.node.getInitializer()
  const { id, identity, jsDoc, location, startOffset, parsedJsDoc } = preparePropertyAnalysis(
    sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    name,
    node,
    node,
  )
  return analyzeTypePropertyMemberInternal(args, {
    initializer,
    typeNode,
    isStatic,
    visibility,
    id,
    identity,
    jsDoc,
    parsedJsDoc,
    location,
    startOffset,
    readonly: node.isReadonly(),
    optional: !!node.getQuestionTokenNode(),
  })
}

const analyzeTypePropertyMemberInternal = (
  args: ChildAnalysisArg<PropertySignature | PropertyDeclaration | GetAccessorDeclaration>,
  args2: {
    readonly: boolean
    optional: boolean
    isStatic: boolean
    visibility: MemberAccessor
    initializer: Expression | undefined
    typeNode: TypeNode | undefined
    id: SymbolId
    identity: SymbolIdentity
    jsDoc: JsDocAnalysis | undefined
    parsedJsDoc: Array<ParsedJsDoc> | undefined
    location: {
      startLine: number
      endLine: number
    }
    startOffset: number
  },
): MemberAnalysisResult<DocumentableTypeProperty> => {
  const {
    sourceRelativePath,
    metadata,
    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    imported,
    options,
    sourceFullText,
    reservedNames,
    declarationOrder,
  } = args
  const { id, identity, jsDoc, location, startOffset, readonly, optional, parsedJsDoc } = args2
  const name = node.getName()

  const newReservedNames = [...reservedNames]
  const genercsDependencies: Array<DependencyCandidate> = []
  if (Node.isTypeParametered(node)) {
    const genericsResult = analyzeGenericsParameters({
      node,
      sourceRelativePath,
      metadata,
      memberPath,
      ownerSymbolId,
      ownerSymbolIdentity,
      sourceFullText,
      declarationOrder: 0,
      imported,
      options,
      reservedNames,
    })
    newReservedNames.push(...genericsResult.parameters)
    genercsDependencies.push(...genericsResult.dependencies)
  }
  // console.dir(typeNode)
  const typeResult = analyzeType(
    {
      node: args2.typeNode ?? args2.initializer,
      memberPath,
      metadata,
      ownerSymbolId,
      ownerSymbolIdentity,
      sourceRelativePath,
      sourceFullText: args.sourceFullText,
      declarationOrder: args.declarationOrder,
      imported,
      options,
      reservedNames: newReservedNames,
    },
    [name],
  )

  const property = {
    documentable: true,
    id,
    identity,
    name,

    readonly,
    optional,

    type: typeResult.member,

    rest: Node.isDotDotDotTokenable(node) ? !!node.getDotDotDotToken() : false,
    declarationOrder,

    jsDoc,
    location,
    parsedJsDoc,
    startOffset,
    docIndent: computeIndent(
      args.sourceFullText,
      args.node.getStart(),
      args.node.getStartLinePos(),
    ),
  } satisfies DocumentableTypeProperty
  registerSymbolSymbolAnalysis(metadata, property)
  return {
    member: property,
    dependencies: [...typeResult.dependencies, ...genercsDependencies],
  }
}
