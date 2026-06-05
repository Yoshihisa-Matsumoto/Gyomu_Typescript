import { SyntaxKind } from 'ts-morph'
import type { Expression, TypeNode } from 'ts-morph'
import type { TypeAnalysis } from '../../symbol/SymbolModel.js'

export const analyzeType = (args: {
  node: TypeNode | undefined
  initializer: Expression | undefined
}): TypeAnalysis | undefined => {
  const { node, initializer } = args
  if (node) {
    return {
      text: node.getText(),
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
  }
  return undefined
}
