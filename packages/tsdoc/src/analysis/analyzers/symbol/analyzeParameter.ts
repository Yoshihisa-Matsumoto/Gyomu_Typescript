import { Node, SyntaxKind } from 'ts-morph'
import { withOptional } from '@gyomu/schema'
import { analyzeType } from './analyzeType.js'
import type { Expression, ParameterDeclaration, TypeNode } from 'ts-morph'
import type { ParameterAnalysis, ParameterStructure } from '../../symbol/SymbolModel.js'

export const analyzeParameter = (node: ParameterDeclaration): ParameterAnalysis => {
  const typeNode = node.getTypeNode()
  const initializer = node.getInitializer()
  return {
    name: node.getName(),

    optional: !!node.getQuestionTokenNode(),

    rest: !!node.getDotDotDotToken(),

    ...withOptional({ type: analyzeType({ node: typeNode, initializer }) }),

    structure: analyzeParameterStructure(withOptional({ node: typeNode, initializer })),
  }
}

const analyzeParameterStructure = (args: {
  node?: TypeNode
  initializer?: Expression
}): ParameterStructure => {
  const { node, initializer } = args
  if (node) {
    if (Node.isUnionTypeNode(node)) return 'union'
    if (Node.isFunctionTypeNode(node)) return 'function'
    if (Node.isUnionTypeNode(node)) return 'union'
    if (Node.isArrayTypeNode(node)) return 'array'
    if (
      Node.isNumberKeyword(node) ||
      Node.isStringKeyword(node) ||
      Node.isStringLiteral(node) ||
      Node.isBooleanKeyword(node) ||
      Node.isLiteralTypeNode(node) ||
      Node.isStringKeyword(node) ||
      Node.isStringLiteral(node) ||
      Node.isBigIntLiteral(node) ||
      Node.isTrueLiteral(node) ||
      Node.isFalseLiteral(node)
    )
      return 'primitive'
  }
  const initialKind = initializer?.getKind()

  if (initialKind) {
    switch (initialKind) {
      case SyntaxKind.TrueKeyword:
      case SyntaxKind.FalseKeyword:
        return 'primitive'
    }
  }

  return 'unknown'
}
