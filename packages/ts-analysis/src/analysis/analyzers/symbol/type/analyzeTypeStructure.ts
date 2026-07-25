import { Node } from 'ts-morph'
import { analyzeDependency, analyzeDependencyFromTypeReference } from '../analyzeDependency.js'
import { tracePlaceIdentity } from '../../../trace/traceUtil.js'
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
import { analyzeTupleTypeNode } from './structure/analyzeTupleTypeNode.js'
import { analyzeTemplateLiteralTypeNode } from './structure/analyzeTemplateLiteralTypeNode.js'
import { analyzeImportTypeNode } from './structure/analyzeImportTypeNode.js'
import { analyzeType } from './analyzeType.js'
import { analyzeOptionalStructureNode } from './structure/analyzeOptionalStructureNode.js'
import { analyzeRestStructureNode } from './structure/analyzeRestStructureNode.js'
import { analyzeNamedTupleMemberStructureNode } from './structure/analyzeNamedTupleMemberStructureNode.js'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { MemberIdentityMemberPath } from '@gyomu/schema/typescript'
import type { TypeStructureAnalysis } from '@gyomu/schema/schemas/typescript'
import type { EntityName, TypeNode } from 'ts-morph'

export const analyzeTypeStructures = (
  args: ChildAnalysisArg<TypeNode>,
  nodeName: Array<string> | undefined,
): MemberAnalysisWithReservedResult<TypeStructureAnalysis> => {
  tracePlaceIdentity(args, args.options, 'analyzeTypeStructures')
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
      options,
    )

    if (Node.isArrayTypeNode(node)) {
      tracePlaceIdentity(args, args.options, 'analyzeTypeStructures:ArrayTypeNode')
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
        reservedNames: typeAlias.reservedNames,
      }
    }
    if (typeName.getText().includes('Array')) {
      tracePlaceIdentity(args, args.options, 'analyzeTypeStructures:Array string')
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
          reservedNames: typeAlias.reservedNames,
        }
      }
      const referencedNodeName = node.getTypeName().getText()

      return {
        member: {
          kind: 'reference',
          targetId: referencedNodeName,
          typeParameters: [],
        },
        dependencies: [analyzeDependency(referencedNodeName, imported, memberPath)],
        reservedNames: typeAlias.reservedNames,
      }
    } else {
      tracePlaceIdentity(args, args.options, 'analyzeTypeStructures:Other')
      const targetName = typeName.getText()
      // console.log(targetName)
      const genericsResult = typeArguments.map((ta, index) => {
        return analyzeType(
          { ...args, node: ta, memberPath: [...memberPath, '$generics', index] },
          undefined,
        )
      })

      return {
        member: {
          kind: 'reference',
          targetId: targetName,
          typeParameters: genericsResult.map((gr) => gr.member),
        },
        dependencies: [
          ...analyzeDependencyFromTypeReference(node, imported, memberPath, reservedNames, options),
          ...genericsResult.map((gr) => gr.dependencies).flat(),
        ],
        reservedNames: [],
      }
    }
  }
  if (Node.isUnionTypeNode(node) || Node.isIntersectionTypeNode(node)) {
    // const isUnion = Node.isUnionTypeNode(node)
    // isUnion ? '$union' : '$intersect',
    tracePlaceIdentity(args, args.options, 'analyzeTypeStructures:Union/Intersection')
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
      reservedNames: memberTypeResult.map((t) => t.reservedNames).flat(),
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
    // console.log(`FunctionTypeNode: ${nodeName}`)
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
        name: nodeName ? (nodeName[0] ?? '') : '',
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
      reservedNames: method.reservedNames,
    }
  }
  if (Node.isMethodSignature(node)) {
    // Somehow It's NOT called??
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
      reservedNames: method.reservedNames,
    }
  }
  if (Node.isTypeLiteral(node)) {
    return analyzeTypeLiteralNode({
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
  }
  if (Node.isTypeQuery(node)) {
    const name = computeTargetId(node.getExprName())
    const dependencies = analyzeDependency(name, imported, memberPath)

    return {
      member: {
        kind: 'reference',
        targetId: computeTargetId(node.getExprName()),
        typeParameters: [],
      },
      dependencies: [dependencies],
      reservedNames: [],
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
      reservedNames: [],
    }
  }
  if (Node.isArrayTypeNode(node)) {
    const argumentNode = node.getElementTypeNode()
    tracePlaceIdentity(args, args.options, 'analyzeTypeStructures:ArrayType')
    const typeAlias = analyzeType(
      {
        sourceRelativePath,
        metadata,
        ownerSymbolId,
        ownerSymbolIdentity,
        memberPath,
        node: argumentNode,
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
      dependencies: typeAlias.dependencies,
      reservedNames: [],
    }
  }

  // TODO : Need more analysis?
  if (Node.isOptionalTypeNode(node)) {
    return analyzeOptionalStructureNode(args, [...memberPath, '$optional'], node)
  }
  // TODO : Need more analysis?
  if (Node.isRestTypeNode(node)) {
    return analyzeRestStructureNode(args, [...memberPath, '$rest'], node)
  }
  // TODO : Need more analysis?
  if (Node.isNamedTupleMember(node)) {
    return analyzeNamedTupleMemberStructureNode(args, [...memberPath, '$namedTupleMember'], node)
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
  if (Node.isTupleTypeNode(node)) return analyzeTupleTypeNode(args, [...memberPath, '$tuple'], node)
  if (Node.isTemplateLiteralTypeNode(node))
    return analyzeTemplateLiteralTypeNode(args, [...memberPath, '$templateLiteral'], node)
  if (Node.isThisTypeNode(node)) {
    return {
      member: {
        kind: 'this',
      },
      dependencies: [],
      reservedNames: [],
    }
  }
  if (Node.isImportTypeNode(node))
    return analyzeImportTypeNode(args, [...memberPath, '$import'], node)

  console.log(`!!Unsupported Type!!`)
  console.dir(node, { depth: null })
  throw new Error('Unsupported Type')
}

const computeTargetId = (typeName: EntityName) => {
  return typeName.getText()
}
