import { Node, SyntaxKind } from 'ts-morph'
import { withOptional } from '@gyomu/schema'
import { detectEffectSignals } from './analyzeEffectType.js'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import type { ProjectRelativePath } from '../../types.js'
import type { FileAnalysisMetadata } from '../../file/FileAnalysisResult.js'
import type {
  MemberAnalysis,
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
  TypeAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/typescript'

import type { EntityName, Expression, TypeLiteralNode, TypeNode } from 'ts-morph'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript'

export const analyzeType = (args: {
  sourcePath: ProjectRelativePath
  metadata: FileAnalysisMetadata
  ownerSymbolId: MemberIdentityOwnerSymbolId
  ownerSymbolIdentity: SymbolIdentity
  memberPath: MemberIdentityMemberPath
  node: TypeNode | undefined
  initializer: Expression | undefined
  nodeName: Array<string> | undefined
  rawText?: string | undefined
  sourceFullText: string
  declarationOrder: number
}): TypeAnalysis | undefined => {
  const {
    node,
    initializer,
    sourcePath,
    memberPath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    nodeName,
  } = args
  if (node) {
    const nodeContent = node.getText()
    console.log(`${nodeContent}`)
    console.log(args.declarationOrder)
    return {
      text: nodeContent,
      ...withOptional({
        effect: detectEffectSignals(nodeContent),
        structure: analyzeTypeStructures(
          sourcePath,
          metadata,
          node,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath,
          nodeName,
          args.sourceFullText,
          args.declarationOrder,
        ),
      }),
    }
  }
  if (initializer) {
    const initialKind = initializer.getKind()
    switch (initialKind) {
      case SyntaxKind.TrueKeyword:
      case SyntaxKind.FalseKeyword:
        return {
          text: 'boolean',
        }
    }
    // if (Node.isObjectLiteralExpression(initializer)) {
    //   return {
    //     text: initializer.getText(),
    //     ...withOptional({
    //       effect: detectEffectSignals(initializer.getText()),
    //     }),
    //     structure: analyzeObjectLiteralTypeStructure({
    //       sourcePath,
    //       initializer,
    //       memberPath,
    //       metadata,
    //       ownerSymbolId,
    //       rawText: initializer.getText(),
    //     }),
    //   }
    // }
  }
  if (args.rawText) {
    return {
      text: args.rawText,
    }
  }
  return undefined
}

const analyzeTypeStructures = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  typeNode: TypeNode,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  oldMemberPath: MemberIdentityMemberPath,
  nodeName: Array<string> | undefined,
  sourceFullText: string,
  declarationOrder: number,
): TypeStructureAnalysis | undefined => {
  const memberPath: MemberIdentityMemberPath = nodeName
    ? [...oldMemberPath, ...nodeName]
    : oldMemberPath
  if (Node.isTypeReference(typeNode)) {
    const typeName = typeNode.getTypeName()
    const typeArguments = typeNode.getTypeArguments()

    const typeAlias = analyzeType({
      sourcePath,
      metadata,
      ownerSymbolId,
      ownerSymbolIdentity,
      memberPath,
      node: typeArguments[0],
      nodeName: undefined,
      initializer: undefined,
      sourceFullText,
      declarationOrder,
    })
    if (Node.isArrayTypeNode(typeNode)) {
      console.log('Array')
      console.log(typeName.getText())
    }
    if (typeName.getText().includes('Array')) {
      console.log('Array')
      console.log(typeName.getText())
      if (typeArguments.length == 1 && typeAlias) {
        return {
          kind: 'array',
          elementType: typeAlias,
        }
      }
    } else {
      return {
        kind: 'reference',
        targetId: computeTargetId(typeName),
      }
    }
  }
  if (Node.isUnionTypeNode(typeNode)) {
    return {
      kind: 'union',
      types: typeNode
        .getTypeNodes()
        .map((childType, index) =>
          analyzeType({
            sourcePath,
            metadata,
            node: childType,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath,
            initializer: undefined,
            nodeName: undefined,
            sourceFullText,
            declarationOrder: index,
          }),
        )
        .filter((v) => !!v),
    }
  }
  if (Node.isFunctionTypeNode(typeNode)) {
    // const typeStructure = analyzeType({
    //   sourcePath,
    //   metadata,
    //   ownerSymbolId,
    //   memberPath,
    //   node: typeNode,
    //   nodeName,
    //   initializer: undefined,
    // })
    const method = analyzeFunctionMember({
      sourcePath,
      memberPath,
      metadata,
      node: typeNode,
      jsDocableNode: Node.isJSDocable(typeNode) ? typeNode : undefined,
      name: nodeName ? (nodeName[0] ?? '') : typeNode.getText(),
      ownerSymbolId,
      ownerSymbolIdentity,
      sourceFullText,
      declarationOrder,
    })
    return {
      kind: 'function',
      parameters: method.parameters,
      ...withOptional({ returnType: method.returnType }),
    }
  }
  if (Node.isTypeLiteral(typeNode)) {
    return {
      kind: 'object',
      members: analyzeTypeLiteralMembers(
        sourcePath,
        metadata,
        typeNode,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        sourceFullText,
      ),
    }
  }
  return undefined
}

const computeTargetId = (typeName: EntityName) => {
  return typeName.getText()
}
const analyzeTypeLiteralMembers = (
  sourcePath: ProjectRelativePath,
  metadata: FileAnalysisMetadata,
  typeNode: TypeLiteralNode,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
  sourceFullText: string,
): Array<MemberAnalysis> | undefined => {
  const members: Array<MemberAnalysis> = typeNode
    .getMembers()
    .flatMap((member, index) => {
      if (Node.isMethodSignature(member)) {
        return [
          analyzeFunctionMember({
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
        ] as Array<MemberAnalysis>
      }
      if (Node.isFunctionTypeNode(member)) {
        if (Node.isJSDocable(member)) {
          return [
            analyzeFunctionMember({
              sourcePath,
              metadata,
              node: member,
              ownerSymbolId,
              ownerSymbolIdentity,
              memberPath,
              jsDocableNode: member,
              name: Node.isNameable(member) ? member.getName()! : member.getText(),
              sourceFullText,
              declarationOrder: index,
            }),
          ]
        }
      }

      if (Node.isPropertySignature(member)) {
        const memberTypeNode = member.getTypeNode()
        if (Node.isFunctionTypeNode(memberTypeNode)) {
          return [
            analyzeFunctionMember({
              sourcePath,
              metadata,
              name: member.getName(),
              node: memberTypeNode,
              jsDocableNode: member,
              ownerSymbolId,
              ownerSymbolIdentity,
              memberPath,
              sourceFullText,
              declarationOrder: index,
            }),
          ] as Array<MemberAnalysis>
        }
        return [
          analyzePropertyMember({
            sourcePath,
            metadata,
            node: member,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath,
            sourceFullText,
            declarationOrder: index,
          }),
        ] as Array<MemberAnalysis>
      }

      return undefined
    })
    .filter((m) => !!m)
  if (members.length > 0) return members
  return undefined
}

// const analyzeParameterStructure = (args: {
//   node?: TypeNode
//   initializer?: Expression
// }): ParameterStructure => {
//   const { node, initializer } = args
//   if (node) {
//     if (Node.isUnionTypeNode(node)) return 'union'
//     if (Node.isFunctionTypeNode(node)) return 'function'
//     if (Node.isUnionTypeNode(node)) return 'union'
//     if (Node.isArrayTypeNode(node)) return 'array'
//     if (
//       Node.isNumberKeyword(node) ||
//       Node.isStringKeyword(node) ||
//       Node.isStringLiteral(node) ||
//       Node.isBooleanKeyword(node) ||
//       Node.isLiteralTypeNode(node) ||
//       Node.isStringKeyword(node) ||
//       Node.isStringLiteral(node) ||
//       Node.isBigIntLiteral(node) ||
//       Node.isTrueLiteral(node) ||
//       Node.isFalseLiteral(node)
//     )
//       return 'primitive'
//   }
//   const initialKind = initializer?.getKind()

//   if (initialKind) {
//     switch (initialKind) {
//       case SyntaxKind.TrueKeyword:
//       case SyntaxKind.FalseKeyword:
//         return 'primitive'
//     }
//   }

//   return 'unknown'
// }
