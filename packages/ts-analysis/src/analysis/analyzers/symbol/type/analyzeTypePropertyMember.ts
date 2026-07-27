import { Node } from 'ts-morph'
import { preparePropertyAnalysis } from '../prepareMemberAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { tracePlaceIdentity } from '../../../trace/traceUtil.js'
import { analyzeType, getUndefinedTypeResult } from './analyzeType.js'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type {
  Expression,
  GetAccessorDeclaration,
  PropertyDeclaration,
  PropertySignature,
  TypeNode,
} from 'ts-morph'

import type { SymbolId } from '@gyomu/schema/typescript'
import type {
  DocumentableTypeProperty,
  JsDocAnalysis,
  MemberAccessor,
  ParsedJsDoc,
  SymbolIdentity,
  TypeProperty,
} from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes a property signature or declaration within a type, returning the computed member analysis.
 *
 * @param args The analysis context including the property node and metadata.
 *
 * @param isStatic Whether the property is static.
 *
 * @param visibility The visibility level of the property.
 *
 * @returns The computed analysis result for the property member.
 */
export const analyzeTypePropertyMember = (
  args: ChildAnalysisArg<PropertySignature | PropertyDeclaration>,
  isStatic: boolean = false,
  visibility: MemberAccessor = 'public',
): MemberAnalysisWithReservedResult<TypeProperty> => {
  tracePlaceIdentity(args, args.options, 'analyzeTypePropertyMember')
  const {
    sourceRelativePath,
    metadata,
    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    options,
  } = args
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
    options,
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
): MemberAnalysisWithReservedResult<DocumentableTypeProperty> => {
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

  // console.dir(typeNode)
  const typeResult =
    args2.typeNode || args2.initializer
      ? analyzeType(
          {
            node: args2.typeNode ?? args2.initializer!,
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
      : getUndefinedTypeResult()

  const property = {
    documentable: true,
    id,
    identity,
    kind: 'type-property',
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
  registerSymbolSymbolAnalysis(metadata, property, options)
  return {
    member: property,
    dependencies: [...typeResult.dependencies],
    reservedNames: typeResult.reservedNames,
  }
}
