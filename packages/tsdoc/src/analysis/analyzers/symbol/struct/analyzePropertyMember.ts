import { withOptional } from '@gyomu/schema'
import { Node } from 'ts-morph'
import { analyzeType } from '../analyzeType.js'
import { preparePropertyAnalysis } from '../prepareMemberAnalysis.js'
import { registerSymbolSymbolAnalysis } from '../../../file/registerSymbolSymbolAnalysis.js'
import { computeIndent } from '../computeIndent.js'
import type {
  Expression,
  GetAccessorDeclaration,
  PropertyDeclaration,
  PropertySignature,
  TypeNode,
} from 'ts-morph'
import type { ProjectRelativePath, SymbolId } from '../../../types.js'
import type { FileAnalysisMetadata } from '../../../file/FileAnalysisResult.js'
import type {
  DocumentablePropertyMemberAnalysis,
  JsDocAnalysis,
  MemberAccessor,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
} from '@gyomu/schema/typescript'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzePropertyMember = (
  args: {
    sourcePath: ProjectRelativePath
    metadata: FileAnalysisMetadata
    node: PropertySignature | PropertyDeclaration
    ownerSymbolId: MemberIdentityOwnerSymbolId
    ownerSymbolIdentity: SymbolIdentity
    memberPath: MemberIdentityMemberPath
    sourceFullText: string
    declarationOrder: number
  },
  isStatic: boolean = false,
  visibility: MemberAccessor = 'public',
): DocumentablePropertyMemberAnalysis => {
  const { sourcePath, metadata, node, ownerSymbolId, ownerSymbolIdentity, memberPath } = args
  const typeNode = args.node.getTypeNode()
  const name = node.getName()
  const initializer = args.node.getInitializer()
  const { id, identity, jsDoc, location, startOffset } = preparePropertyAnalysis(
    sourcePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    memberPath,
    name,
    node,
    node,
  )
  return analyzePropertyMemberInternal(args, {
    initializer,
    typeNode,
    isStatic,
    visibility,
    id,
    identity,
    jsDoc,
    location,
    startOffset,
    readonly: node.isReadonly(),
    optional: !!node.getQuestionTokenNode(),
  })
  // const name = node.getName()
  // const { identity, jsDoc, location, startOffset } = preparePropertyAnalysis(
  //   sourcePath,
  //   metadata,
  //   ownerSymbolId,
  //   memberPath,
  //   name,
  //   node,
  //   node,
  // )

  // // console.dir(typeNode)
  // return {
  //   kind: 'property',
  //   source: 'property-declaration',
  //   identity,
  //   name,
  //   readonly: node.isReadonly(),
  //   optional: !!node.getQuestionTokenNode(),

  //   ...withOptional({
  //     type: analyzeType({
  //       node: typeNode,
  //       initializer,
  //       memberPath,
  //       metadata,
  //       ownerSymbolId,
  //       sourcePath,
  //       nodeName: [name],
  //     }),
  //     jsDoc,
  //   }),
  //   location,
  //   startOffset,

  //   static: isStatic,
  //   visibility: visibility,
  // }
}

export const analyzePropertyMemberInternal = (
  args: {
    sourcePath: ProjectRelativePath
    metadata: FileAnalysisMetadata
    node: PropertySignature | PropertyDeclaration | GetAccessorDeclaration
    ownerSymbolId: MemberIdentityOwnerSymbolId
    ownerSymbolIdentity: SymbolIdentity
    memberPath: MemberIdentityMemberPath
    sourceFullText: string
    declarationOrder: number
  },
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
    location: {
      startLine: number
      endLine: number
    }
    startOffset: number
  },
): DocumentablePropertyMemberAnalysis => {
  const { sourcePath, metadata, node, ownerSymbolId, ownerSymbolIdentity, memberPath } = args
  const { id, identity, jsDoc, location, startOffset, readonly, optional } = args2
  const name = node.getName()

  // console.dir(typeNode)

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
    ...withOptional({
      type: analyzeType({
        node: args2.typeNode,
        initializer: args2.initializer,
        memberPath,
        metadata,
        ownerSymbolId,
        ownerSymbolIdentity,
        sourcePath,
        nodeName: [name],
        sourceFullText: args.sourceFullText,
        declarationOrder: args.declarationOrder,
      }),
      jsDoc,
    }),
    location,
    startOffset,
    rest: Node.isDotDotDotTokenable(node) ? !!node.getDotDotDotToken() : false,

    static: args2.isStatic,
    visibility: args2.visibility,
    declarationOrder: args.declarationOrder,
  } satisfies DocumentablePropertyMemberAnalysis
  registerSymbolSymbolAnalysis(
    metadata,
    property,
    computeIndent(args.sourceFullText, args.node.getStart(), args.node.getStartLinePos()),
  )
  return property
}
