import { Node, SyntaxKind } from 'ts-morph'
import { withOptional } from '@gyomu/schema'
import { detectEffectSignals } from './analyzeEffectType.js'
import { analyzeFunctionMember } from './struct/analyzeFunctionMember.js'
import { analyzePropertyMember } from './struct/analyzePropertyMember.js'
import { analyzeEffectSchema, getSupportedEffectSchemaType } from './analyzeEffectSchema.js'
import type { ChildAnalysisArg } from '../types.js'
import type {
  MemberAnalysis,
  MemberIdentityMemberPath,
  TypeAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/typescript'

import type { EntityName, Expression, TypeLiteralNode, TypeNode } from 'ts-morph'

export const analyzeType = (
  args: ChildAnalysisArg<TypeNode | Expression | undefined>,
  nodeName: Array<string> | undefined,
  rawText?: string | undefined,
): TypeAnalysis | undefined => {
  const {
    node,
    sourceRelativePath,
    memberPath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    declarationOrder,
    imported,
    options,
    sourceFullText,
  } = args

  if (node) {
    if (Node.isTypeNode(node)) {
      const nodeContent = node.getText()
      // console.log(`${nodeContent}`)
      // console.log(args.declarationOrder)
      return {
        text: nodeContent,
        source: 'typescript',
        ...withOptional({
          effect: detectEffectSignals(nodeContent),
          structure: analyzeTypeStructures(
            {
              sourceRelativePath,
              metadata,
              node,
              ownerSymbolId,
              ownerSymbolIdentity,
              memberPath,

              sourceFullText,
              declarationOrder,
              imported,
              options,
            },
            nodeName,
          ),
        }),
      }
    } else {
      if (Node.isCallExpression(node) || Node.isPropertyAccessExpression(node)) {
        const schemaEffectExpression = getSupportedEffectSchemaType(node)
        if (schemaEffectExpression != null) {
          // console.dir(schemaEffectExpression)
          // console.log(nodeName)
          return analyzeEffectSchema(schemaEffectExpression, {
            name: nodeName?.[0] ?? '',
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath,
          })
        }
      }

      const initialKind = node.getKind()
      switch (initialKind) {
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.FalseKeyword:
          return {
            text: 'boolean',
            source: 'typescript',
          }
        case SyntaxKind.StringKeyword:
          return {
            text: 'string',
            source: 'typescript',
          }
        case SyntaxKind.BooleanKeyword:
          return {
            text: 'boolean',
            source: 'typescript',
          }
        case SyntaxKind.NumberKeyword:
          return {
            text: 'number',
            source: 'typescript',
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
  }
  if (rawText) {
    return {
      text: rawText,
      source: 'typescript',
    }
  }
  return undefined
}

const analyzeTypeStructures = (
  args: ChildAnalysisArg<TypeNode>,
  nodeName: Array<string> | undefined,
): TypeStructureAnalysis | undefined => {
  const {
    sourceRelativePath,
    metadata,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
    declarationOrder,
    imported,
    options,
    node,
  } = args
  const memberPath: MemberIdentityMemberPath = nodeName
    ? [...args.memberPath, ...nodeName]
    : args.memberPath
  if (Node.isTypeReference(node)) {
    const typeName = node.getTypeName()
    const typeArguments = node.getTypeArguments()

    const typeAlias = analyzeType(
      {
        sourceRelativePath,
        metadata,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        node: typeArguments[0],
        sourceFullText,
        declarationOrder,
        imported,
        options,
      },
      undefined,
    )
    if (Node.isArrayTypeNode(node)) {
      // console.log('Array')
      // console.log(typeName.getText())
    }
    if (typeName.getText().includes('Array')) {
      // console.log('Array')
      // console.log(typeName.getText())
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
  if (Node.isUnionTypeNode(node)) {
    return {
      kind: 'union',
      types: node
        .getTypeNodes()
        .map((childType, index) =>
          analyzeType(
            {
              sourceRelativePath,
              metadata,
              node: childType,
              ownerSymbolId,
              ownerSymbolIdentity,
              memberPath,
              sourceFullText,
              declarationOrder: index,
              imported,
              options,
            },
            undefined,
          ),
        )
        .filter((v) => !!v),
    }
  }
  if (Node.isFunctionTypeNode(node)) {
    // const typeStructure = analyzeType({
    //   sourcePath,
    //   metadata,
    //   ownerSymbolId,
    //   memberPath,
    //   node: typeNode,
    //   nodeName,
    //   initializer: undefined,
    // })
    const method = analyzeFunctionMember(
      {
        sourceRelativePath,
        memberPath,
        metadata,
        node,
        ownerSymbolId,
        ownerSymbolIdentity,
        sourceFullText,
        declarationOrder,
        imported,
        options,
      },
      {
        isStatic: undefined,
        visibility: undefined,
        name: nodeName ? (nodeName[0] ?? '') : node.getText(),
        jsDocableNode: Node.isJSDocable(node) ? node : undefined,
      },
    )
    return {
      kind: 'function',
      parameters: method.parameters,
      ...withOptional({ returnType: method.returnType }),
    }
  }
  if (Node.isTypeLiteral(node)) {
    return {
      kind: 'object',
      members: analyzeTypeLiteralMembers({
        sourceRelativePath,
        metadata,
        node,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        sourceFullText,
        declarationOrder,
        imported,
        options,
      }),
    }
  }
  return undefined
}

const computeTargetId = (typeName: EntityName) => {
  return typeName.getText()
}
const analyzeTypeLiteralMembers = (
  args: ChildAnalysisArg<TypeLiteralNode>,
): Array<MemberAnalysis> | undefined => {
  const {
    node,
    sourceRelativePath,
    imported,
    memberPath,
    metadata,
    options,
    ownerSymbolId,
    ownerSymbolIdentity,
    sourceFullText,
  } = args
  const members: Array<MemberAnalysis> = node
    .getMembers()
    .flatMap((member, index) => {
      if (Node.isMethodSignature(member)) {
        return [
          analyzeFunctionMember(
            {
              sourceRelativePath,
              metadata,
              node: member,
              ownerSymbolId,
              ownerSymbolIdentity,
              memberPath,

              sourceFullText,
              declarationOrder: index,
              imported,
              options,
            },
            {
              isStatic: undefined,
              visibility: undefined,
              name: member.getName(),
              jsDocableNode: member,
            },
          ),
        ] as Array<MemberAnalysis>
      }
      if (Node.isFunctionTypeNode(member)) {
        if (Node.isJSDocable(member)) {
          return [
            analyzeFunctionMember(
              {
                sourceRelativePath,
                metadata,
                node: member,
                ownerSymbolId,
                ownerSymbolIdentity,
                memberPath,

                sourceFullText,
                declarationOrder: index,
                imported,
                options,
              },
              {
                isStatic: undefined,
                visibility: undefined,
                name: Node.isNameable(member) ? member.getName()! : member.getText(),
                jsDocableNode: member,
              },
            ),
          ]
        }
      }

      if (Node.isPropertySignature(member)) {
        const memberTypeNode = member.getTypeNode()
        if (Node.isFunctionTypeNode(memberTypeNode)) {
          return [
            analyzeFunctionMember(
              {
                sourceRelativePath,
                metadata,
                node: memberTypeNode,
                ownerSymbolId,
                ownerSymbolIdentity,
                memberPath,
                sourceFullText,
                declarationOrder: index,
                imported,
                options,
              },
              {
                isStatic: undefined,
                visibility: undefined,
                name: member.getName(),
                jsDocableNode: member,
              },
            ),
          ] as Array<MemberAnalysis>
        }
        return [
          analyzePropertyMember({
            sourceRelativePath,
            metadata,
            node: member,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath,
            sourceFullText,
            declarationOrder: index,
            imported,
            options,
          }),
        ] as Array<MemberAnalysis>
      }

      return undefined
    })
    .filter((m) => !!m)
  if (members.length > 0) return members
  return undefined
}
