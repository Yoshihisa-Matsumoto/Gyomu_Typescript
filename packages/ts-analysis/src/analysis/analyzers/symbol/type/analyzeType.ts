import { Node, SyntaxKind } from 'ts-morph'
import { detectEffectSignals } from '../analyzeEffectType.js'
import { analyzeEffectSchema, getSupportedEffectSchemaType } from '../analyzeEffectSchema.js'
import { analyzeDependency, analyzeDependencyFromTypeReference } from '../analyzeDependency.js'
import { analyzeTypeFunction } from './analyzeTypeFunction.js'
import { analyzeIndexedAccessTypeNode } from './structure/analyzeIndexedAccessTypeNode.js'
import { analyzeMappedTypeNode } from './structure/analyzeMappedTypeNode.js'
import { analyzeConditionalTypeNode } from './structure/analyzeConditionalTypeNode.js'
import { analyzeInferTypeNode } from './structure/analyzeInferTypeNode.js'
import { analyzeTypeLiteralNode } from './structure/analyzeTypeLiteralNode.js'
import { analyzeTypeOperatorTypeNode } from './structure/analyzeTypeOperatorTypeNode.js'
import { analyzeConstructorTypeNode } from './structure/analyzeConstructorTypeNode.js'
import { analyzeParenthesizedStructureNode } from './structure/analyzeParenthesizedStructureNode.js'
import { analyzeTypePredicateNode } from './structure/analyzeTypePredicateNode.js'
import type { ChildAnalysisArg, MemberAnalysisResult } from '../../types.js'
import type { MemberIdentityMemberPath } from '@gyomu/schema/typescript'
import type { TypeAnalysis, TypeStructureAnalysis } from '@gyomu/schema/schemas/typescript'
import type { CallExpression, EntityName, Expression, TypeNode } from 'ts-morph'

export const analyzeType = (
  args: ChildAnalysisArg<TypeNode | Expression | undefined>,
  nodeName: Array<string> | undefined,

  rawText?: string | undefined,
): MemberAnalysisResult<TypeAnalysis> => {
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
    reservedNames,
  } = args
  if (node) {
    if (Node.isTypeNode(node)) {
      const nodeContent = node.getText()
      // console.log(`${nodeContent}`)
      // console.log(args.declarationOrder)
      // const genericsResult = analyzeGenericsParameters(args as ChildAnalysisArg<TypeNode>)

      const structureResult = analyzeTypeStructures(
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
          reservedNames,
        },
        nodeName,
      )
      return {
        member: {
          text: nodeContent,
          source: 'typescript',

          effect: detectEffectSignals(nodeContent),
          structure: structureResult?.member,
        },
        dependencies: structureResult?.dependencies ?? [],
      }
    } else {
      const newMemberPath: MemberIdentityMemberPath = [...memberPath, ...(nodeName ?? [])]
      if (Node.isCallExpression(node) || Node.isPropertyAccessExpression(node)) {
        const schemaEffectExpression = getSupportedEffectSchemaType(
          node,
          undefined,
          [],
          args.imported,
          newMemberPath,
        )
        if (schemaEffectExpression != null) {
          // console.dir(schemaEffectExpression)
          // console.log(nodeName)
          const effectSchema = analyzeEffectSchema(schemaEffectExpression, {
            name: nodeName?.[0] ?? '',
            ownerSymbolId,
            ownerSymbolIdentity,
            imported,
            memberPath: newMemberPath,
            dependencies: schemaEffectExpression.dependencies,
          })
          if (effectSchema) return effectSchema
        }
      }

      const initialKind = node.getKind()
      switch (initialKind) {
        case SyntaxKind.TrueKeyword:
        case SyntaxKind.FalseKeyword:
          return {
            member: {
              text: 'boolean',
              source: 'typescript',
            },
            dependencies: [],
          }
        case SyntaxKind.StringKeyword:
          return {
            member: {
              text: 'string',
              source: 'typescript',
            },
            dependencies: [],
          }
        case SyntaxKind.BooleanKeyword:
          return {
            member: {
              text: 'boolean',
              source: 'typescript',
            },
            dependencies: [],
          }
        case SyntaxKind.NumberKeyword:
          return {
            member: {
              text: 'number',
              source: 'typescript',
            },
            dependencies: [],
          }
        case SyntaxKind.VoidKeyword:
          return {
            member: {
              text: 'void',
              source: 'typescript',
            },
            dependencies: [],
          }
        case SyntaxKind.CallExpression: {
          const callExpression = node as CallExpression
          const expression = callExpression.getExpression()
          const dependency = analyzeDependency(expression.getText(), imported, newMemberPath)
          if (Node.isIdentifier(expression)) {
            return {
              member: {
                source: 'typescript',
                text: expression.getText(),
              },
              dependencies: [dependency],
            }
          }
          // console.log('CallExpression Not handled')
          // console.dir(node, { depth: null })
          break
        }
        default:
          return {
            member: {
              source: 'typescript',
              text: node.getText(),
            },
            dependencies: [],
          }
      }
      return {
        member: {
          source: 'typescript',
          text: node.getText(),
        },
        dependencies: [],
      }
    }
  } else {
    return {
      member: {
        text: rawText ?? '',
        source: 'typescript',
      },
      dependencies: [],
    }
  }
}

const analyzeTypeStructures = (
  args: ChildAnalysisArg<TypeNode>,
  nodeName: Array<string> | undefined,
): MemberAnalysisResult<TypeStructureAnalysis> | undefined => {
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
    reservedNames,
  } = args
  const memberPath: MemberIdentityMemberPath = nodeName
    ? [...args.memberPath, ...nodeName]
    : args.memberPath
  if (Node.isTypeReference(node)) {
    const typeName = node.getTypeName()
    const typeArguments = node.getTypeArguments()

    const dependencies = analyzeDependencyFromTypeReference(
      node,
      imported,
      memberPath,
      reservedNames,
    )

    if (Node.isArrayTypeNode(node)) {
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
          reservedNames,
        },
        undefined,
      )
      // console.log('Array')
      // console.log(typeName.getText())
      return {
        member: {
          kind: 'array',
          elementType: typeAlias.member,
        },
        dependencies,
      }
    }
    if (typeName.getText().includes('Array')) {
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
          reservedNames,
        },
        undefined,
      )
      // console.log('Array')
      // console.log(typeName.getText())
      if (typeArguments.length == 1) {
        return {
          member: {
            kind: 'array',
            elementType: typeAlias.member,
          },
          dependencies,
        }
      }
      const referencedNodeName = node.getTypeName().getText()
      return {
        member: {
          kind: 'reference',
          targetId: referencedNodeName,
        },
        dependencies: [analyzeDependency(referencedNodeName, imported, memberPath)],
      }
    } else {
      // Generics

      const parametersResult = node.getTypeArguments().map((argument, index) => {
        const newMemberPath = [...memberPath, '$generics', index]
        return analyzeType(
          {
            sourceRelativePath,
            metadata,
            ownerSymbolId,
            ownerSymbolIdentity,
            memberPath: newMemberPath,
            node: argument,
            sourceFullText,
            declarationOrder,
            imported,
            options,
            reservedNames,
          },
          undefined,
        )
      })
      return {
        member: {
          kind: 'generics',
          typeParameters: parametersResult.map((p) => p.member),
        },
        dependencies: [...dependencies, ...parametersResult.map((p) => p.dependencies).flat()],
      }
    }
  }
  if (Node.isUnionTypeNode(node) || Node.isIntersectionTypeNode(node)) {
    const memberTypeResult = node.getTypeNodes().map((childType, index) =>
      analyzeType(
        {
          sourceRelativePath,
          metadata,
          node: childType,
          ownerSymbolId,
          ownerSymbolIdentity,
          memberPath: [...memberPath, index],
          sourceFullText,
          declarationOrder: index,
          imported,
          options,
          reservedNames,
        },
        undefined,
      ),
    )
    return {
      member: {
        kind: 'union',
        types: memberTypeResult.map((t) => t.member),
      },
      dependencies: memberTypeResult.map((t) => t.dependencies).flat(),
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
    console.log(`FunctionTypeNode: ${nodeName}`)
    const method = analyzeTypeFunction(
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
        reservedNames,
      },
      {
        name: nodeName ? (nodeName[0] ?? '') : node.getText(),
        jsDocableNode: Node.isJSDocable(node) ? node : undefined,
      },
    )
    return {
      member: {
        kind: 'function',
        parameters: method.member.parameters,
        returnType: method.member.returnType,
      },
      dependencies: method.dependencies,
    }
  }
  if (Node.isMethodSignature(node)) {
    // console.log(`MethodSignature: ${nodeName}`)
    const method = analyzeTypeFunction(
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
        reservedNames,
      },
      {
        name: nodeName ? (nodeName[0] ?? '') : node.getText(),
        jsDocableNode: Node.isJSDocable(node) ? node : undefined,
      },
    )
    return {
      member: {
        kind: 'function',
        parameters: method.member.parameters,
        returnType: method.member.returnType,
      },
      dependencies: method.dependencies,
    }
  }
  if (Node.isTypeLiteral(node)) {
    const membersResult = analyzeTypeLiteralNode({
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
      reservedNames,
    })
    return {
      member: {
        kind: 'object',
        members: membersResult?.member,
      },
      dependencies: membersResult?.dependencies ?? [],
    }
  }
  if (Node.isTypeQuery(node)) {
    const name = computeTargetId(node.getExprName())
    const dependencies = analyzeDependency(name, imported, memberPath)
    return {
      member: {
        kind: 'reference',
        targetId: computeTargetId(node.getExprName()),
      },
      dependencies: [dependencies],
    }
  }
  if (Node.isLiteralTypeNode(node)) {
    const literal = node.getLiteral()

    return {
      member: {
        kind: 'literal',
        elementValue: literal.getText(),
      },
      dependencies: [],
    }
  }

  if (Node.isIndexedAccessTypeNode(node)) {
    return analyzeIndexedAccessTypeNode(args, [...memberPath, '$indexed'], node)
  }

  if (Node.isMappedTypeNode(node)) {
    return analyzeMappedTypeNode(args, [...memberPath, '$mapped'], node)
  }
  if (Node.isConditionalTypeNode(node)) {
    return analyzeConditionalTypeNode(args, [...memberPath, '$conditional'], node)
  }
  if (Node.isInferTypeNode(node)) {
    return analyzeInferTypeNode(args, [...memberPath, '$infer'], node)
  }
  if (Node.isTypeOperatorTypeNode(node)) {
    return analyzeTypeOperatorTypeNode(args, [...memberPath, '$operator'], node)
  }
  if (Node.isConstructorTypeNode(node))
    return analyzeConstructorTypeNode(args, [...memberPath, '$constructor'], node)
  if (Node.isParenthesizedTypeNode(node))
    return analyzeParenthesizedStructureNode(args, [...memberPath, '$parenthesize'], node)
  if (Node.isTypePredicate(node))
    return analyzeTypePredicateNode(args, [...memberPath, '$typePredicate'], node)
  console.log(`!!Unsupported Type!!`)
  console.dir(node, { depth: null })
  throw new Error('Unsupported Type')
  return undefined
}

const computeTargetId = (typeName: EntityName) => {
  return typeName.getText()
}
