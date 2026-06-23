import { registerSymbolJsDoc } from '../../file/registerSymbolJsDoc.js'
import { extractJsDoc } from '../../extract/extractJsDoc.js'
import { createMemberIdentityAndId } from '../../shared/createMemberIdentity.js'
import type {
  ConstructorDeclaration,
  FunctionTypeNode,
  GetAccessorDeclaration,
  JSDocableNode,
  MethodDeclaration,
  MethodSignature,
  Node,
  PropertyDeclaration,
  PropertySignature,
} from 'ts-morph'
import type {
  JsDocAnalysis,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
  ParsedJsDoc,
} from '@gyomu/schema/typescript'
import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'
import type { ProjectRelativePath, SymbolId } from '../../types.js'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const preparePropertyAnalysis = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  propertyName: string,
  node: PropertySignature | PropertyDeclaration,
  jsDocableNode: JSDocableNode & Node,
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
      signatureId: 'property',
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
  })
}

export const prepareMethodAnalysis = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
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
  })
}

export const initializeMethodIdentity = (
  ownerSymbolId: MemberIdentityOwnerSymbolId,
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

const prepareMemberAnalysis = (args: {
  sourcePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  id: SymbolId
  identity: SymbolIdentity
  node: Node
  jsDocableNode: JSDocableNode & Node
}): {
  id: SymbolId
  identity: SymbolIdentity
  jsDoc: JsDocAnalysis | undefined
  parsedJsDoc: Array<ParsedJsDoc> | undefined
  location: { startLine: number; endLine: number }
  startOffset: number
  snippet: string
} => {
  const { id, identity, node, jsDocableNode, metadata } = args

  const extractedJsDoc = extractJsDoc(jsDocableNode)
  registerSymbolJsDoc(id, metadata, extractedJsDoc)

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
): string => {
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

  return `${typeParams ? '(' + typeParams + ')' : ''}(${params}):${returnTypeText}`
}
