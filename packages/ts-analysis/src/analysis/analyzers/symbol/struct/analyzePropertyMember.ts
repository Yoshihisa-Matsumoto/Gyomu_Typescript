import { Node } from 'ts-morph'
import { analyzeType } from '../type/analyzeType.js'
import { preparePropertyAnalysis } from '../prepareMemberAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import { analyzeGenericsParameters } from '../analyzeGenericsParameters.js'
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
  DocumentablePropertyMemberAnalysis,
  JsDocAnalysis,
  MemberAccessor,
  ParsedJsDoc,
  SymbolIdentity,
} from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes a property member declaration to produce structured analysis results.
 *
 * @param args The input context for analyzing the property member.
 *
 * @param isStatic Whether the property is static.
 *
 * @param visibility The visibility level of the property member.
 *
 * @returns The analysis result containing documentable property details.
 */
export const analyzePropertyMember = (
  args: ChildAnalysisArg<PropertySignature | PropertyDeclaration>,
  isStatic: boolean = false,
  visibility: MemberAccessor = 'public',
): MemberAnalysisResult<DocumentablePropertyMemberAnalysis> => {
  const {
    sourceRelativePath,
    metadata,
    node,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    options,
    registerSymbol,
  } = args
  const typeNode = args.node.getTypeNode()
  const name = node.getName()
  const initializer = args.node.getInitializer()
  const { id, identity, jsDoc, location, startOffset, parsedJsDoc } = preparePropertyAnalysis({
    sourcePath: sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    propertyName: name,
    node,
    jsDocableNode: node,
    options,
    registerSymbol,
  })
  return analyzePropertyMemberInternal(args, {
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

/**
 * Internal helper to perform property member analysis, handling generics, type resolution, and registration.
 *
 * @param args The input context for analysis.
 *
 * @param args2 Configuration object containing metadata, location, and structural information about the property.
 *
 * @returns An object containing the analyzed property member and its dependencies.
 */
export const analyzePropertyMemberInternal = (
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
    parsedJsDoc: ReadonlyArray<ParsedJsDoc> | undefined
    location: {
      startLine: number
      endLine: number
    }
    startOffset: number
  },
): MemberAnalysisResult<DocumentablePropertyMemberAnalysis> => {
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
    registerSymbol,
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
      registerSymbol,
    })
    newReservedNames.push(...genericsResult.parameters)
    genercsDependencies.push(...genericsResult.dependencies)
  }
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
            registerSymbol,
          },
          [name],
        )
      : undefined

  const property = {
    kind: 'property',
    documentable: true,
    source: 'property-declaration',
    id,
    identity,
    ownerSymbolId,
    name,

    readonly,
    optional,

    type: typeResult?.member,
    binding: undefined, // TODO : No NameBinding?
    jsDoc,
    parsedJsDoc,

    location,
    startOffset,
    rest: Node.isDotDotDotTokenable(node) ? !!node.getDotDotDotToken() : false,

    static: args2.isStatic,
    visibility: args2.visibility,
    declarationOrder: args.declarationOrder,
    docIndent: computeIndent(
      args.sourceFullText,
      args.node.getStart(),
      args.node.getStartLinePos(),
    ),
  } satisfies DocumentablePropertyMemberAnalysis
  registerSymbolSymbolAnalysis(metadata, property, options, registerSymbol)
  return {
    member: property,
    dependencies: [...(typeResult?.dependencies ?? []), ...genercsDependencies],
  }
}
