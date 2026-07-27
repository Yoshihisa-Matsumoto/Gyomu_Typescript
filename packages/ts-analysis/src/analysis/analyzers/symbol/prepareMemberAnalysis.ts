import { SignatureId } from '@gyomu/schema/typescript'
import { registerSymbolJsDoc } from '../../file/registerSymbolJsDoc.js'
import { extractJsDoc } from '../../extract/extractJsDoc.js'
import { createMemberIdentityAndId } from '../../shared/createMemberIdentity.js'
import type { AnalysisOptions } from '@gyomu/schema'
import type {
  FileAnalysisMetadata,
  MemberIdentityMemberPath,
  ProjectRelativePath,
  SymbolId,
} from '@gyomu/schema/typescript'
import type {
  ConstructorDeclaration,
  EnumMember,
  FunctionTypeNode,
  GetAccessorDeclaration,
  JSDocableNode,
  MethodDeclaration,
  MethodSignature,
  Node,
  PropertyDeclaration,
  PropertySignature,
} from 'ts-morph'
import type { JsDocAnalysis, ParsedJsDoc, SymbolIdentity } from '@gyomu/schema/schemas/typescript'

/**
 * Prepares analysis for a property member by constructing its identity and delegating to member analysis.
 *
 * @returns A structure containing the symbol identification, JSDoc metadata, location, and code snippet.
 */
export const preparePropertyAnalysis = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  ownerSymbolId: SymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  propertyName: string,
  node: PropertySignature | PropertyDeclaration | EnumMember,
  jsDocableNode: JSDocableNode & Node,
  options: AnalysisOptions | undefined,
): {
  id: SymbolId
  identity: SymbolIdentity
  jsDoc: JsDocAnalysis | undefined
  parsedJsDoc: Array<ParsedJsDoc> | undefined
  location: { startLine: number; endLine: number }
  startOffset: number
  snippet: string
} => {
  const newMemberPath = [...memberPath, propertyName]
  const { id, identity } = createMemberIdentityAndId(
    {
      ownerSymbolId,
      memberPath: newMemberPath,
      signatureId: SignatureId('property'),
    },
    ownerSymbolIdentity,
  )
  return prepareMemberAnalysis({
    sourcePath,
    metadata,
    id,
    identity,
    node,
    jsDocableNode,
    options,
  })
}

/**
 * Prepares analysis for a method or accessor member by initializing its identity and delegating to member analysis.
 *
 * @returns A structure containing the symbol identification, JSDoc metadata, location, and code snippet.
 */
export const prepareMethodAnalysis = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  ownerSymbolId: SymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  methodName: string,
  node:
    | MethodSignature
    | FunctionTypeNode
    | MethodDeclaration
    | ConstructorDeclaration
    | GetAccessorDeclaration,
  jsDocableNode: JSDocableNode & Node,
  options: AnalysisOptions | undefined,
): {
  id: SymbolId
  identity: SymbolIdentity
  jsDoc: JsDocAnalysis | undefined
  parsedJsDoc: Array<ParsedJsDoc> | undefined
  location: { startLine: number; endLine: number }
  startOffset: number
  snippet: string
} => {
  return prepareMemberAnalysis({
    sourcePath,
    metadata,
    ...initializeMethodIdentity(ownerSymbolId, ownerSymbolIdentity, memberPath, methodName, node),
    node,
    jsDocableNode,
    options,
  })
}

/**
 * Initializes and returns the identity and unique symbol ID for a method based on its owner and signature.
 *
 * @returns An object containing the unique symbol ID and identity metadata.
 */
export const initializeMethodIdentity = (
  ownerSymbolId: SymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  methodName: string,
  node:
    | MethodSignature
    | FunctionTypeNode
    | MethodDeclaration
    | ConstructorDeclaration
    | GetAccessorDeclaration,
): { id: SymbolId; identity: SymbolIdentity } => {
  const newMemberPath = [...memberPath, methodName]
  return createMemberIdentityAndId(
    {
      ownerSymbolId,
      memberPath: newMemberPath,
      signatureId: getFunctionSignatureId(node),
    },
    ownerSymbolIdentity,
  )
}

/**
 * Performs the core analysis of a member node, including extracting and registering its JSDoc and capturing location metadata.
 *
 * @returns A structure containing symbol identification, JSDoc metadata, location info, and the raw code snippet.
 */
export const prepareMemberAnalysis = (args: {
  sourcePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  id: SymbolId
  identity: SymbolIdentity
  node: Node
  jsDocableNode: JSDocableNode & Node
  options: AnalysisOptions | undefined
}): {
  id: SymbolId
  identity: SymbolIdentity
  jsDoc: JsDocAnalysis | undefined
  parsedJsDoc: Array<ParsedJsDoc> | undefined
  location: { startLine: number; endLine: number }
  startOffset: number
  snippet: string
} => {
  const { id, identity, node, jsDocableNode, metadata, options } = args

  const extractedJsDoc = extractJsDoc(jsDocableNode)

  registerSymbolJsDoc(id, metadata, extractedJsDoc, options)

  return {
    id,
    identity,
    jsDoc: extractedJsDoc?.analysis,
    parsedJsDoc: extractedJsDoc?.parsed,
    location: {
      startLine: jsDocableNode.getStartLineNumber(),
      endLine: jsDocableNode.getEndLineNumber(),
    },
    startOffset: jsDocableNode.getStart(),
    snippet: node.getText(),
  }
}

const normalizeTypeText = (text: string): string => text.replace(/import\([^)]*\)\./g, '')

const getFunctionSignatureId = (
  declaration:
    | MethodSignature
    | FunctionTypeNode
    | MethodDeclaration
    | ConstructorDeclaration
    | GetAccessorDeclaration,
): SignatureId => {
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

  const returnTypeText = normalizeTypeText(declaration.getReturnType().getText(declaration))

  return SignatureId(`${typeParams ? '(' + typeParams + ')' : ''}(${params}):${returnTypeText}`)
}
