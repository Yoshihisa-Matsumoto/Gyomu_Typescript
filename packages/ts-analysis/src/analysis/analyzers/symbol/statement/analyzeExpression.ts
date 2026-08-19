import { SyntaxKind } from 'ts-morph'
import { analyzeGenericsParameters } from '../type/analyzeGenericsParameters.js'
import { analyzeDependency } from '../analyzeDependency.js'
import { analyzeProperty } from './analyzeProperty.js'
import { analyzeCallExpression } from './analyzeCall.js'
import { analyzeNewExpression } from './analyzeNew.js'
import { analyzeAwaitExpression } from './analyzeAwait.js'
import { analyzeBinaryExpression } from './analyzeBinary.js'
import { analyzeFunctionExpression } from './analyzeFunction.js'
import { analyzeAsExpression } from './analyzeAs.js'
import type {
  ArrayLiteralExpression,
  ArrowFunction,
  AsExpression,
  AwaitExpression,
  BinaryExpression,
  CallExpression,
  ElementAccessExpression,
  Expression,
  NewExpression,
  NumericLiteral,
  ObjectLiteralExpression,
  PostfixUnaryExpression,
  PrefixUnaryExpression,
  PropertyAccessExpression,
  StringLiteral,
  TypeOfExpression,
  YieldExpression,
} from 'ts-morph'
import type { ChildAnalysisArg, ExpressionAnalysisResult } from '../../types.js'
import type { DependencyCandidate } from '@gyomu/schema/schemas/typescript'
import { analyzeTypeOfExpression } from './analyzeTypeOf.js'

/**
 * Analyzes a TypeScript Expression node to determine its type structure and dependencies, including support for effect schema identification and literal values.
 *
 * @param args The configuration object containing the expression node and analysis context.
 *
 * @returns A result object containing the analyzed type structure, dependencies, and reserved names.
 */
export const analyzeExpression = (args: ChildAnalysisArg<Expression>): ExpressionAnalysisResult => {
  const { node, memberPath, imported } = args
  const genericsParametersResult = analyzeGenericsParameters(args)

  const initialKind = node.getKind()
  switch (initialKind) {
    case SyntaxKind.TrueKeyword:
      return {
        element: { kind: 'identifier', name: 'true' },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.FalseKeyword:
      return {
        element: { kind: 'identifier', name: 'false' },
        dependencies: [],
        reservedNames: [],
      }

    case SyntaxKind.StringLiteral:
      return {
        element: { kind: 'string-literal', value: (node as StringLiteral).getLiteralText() },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.NumericLiteral:
      return {
        element: { kind: 'numeric-literal', value: (node as NumericLiteral).getLiteralValue() },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.ArrayLiteralExpression: {
      const children = (node as ArrayLiteralExpression)
        .getElements()
        .map((e) => analyzeExpression({ ...args, node: e }))

      return {
        element: { kind: 'array-literal', value: children.map((c) => c.element) },
        dependencies: children.map((c) => c.dependencies).flat(),
        reservedNames: children.map((c) => c.reservedNames).flat(),
      }
    }

    case SyntaxKind.PrefixUnaryExpression: {
      const unary = node as PrefixUnaryExpression
      const operand = analyzeExpression({ ...args, node: unary.getOperand() })
      return {
        element: { kind: 'unary', prefix: true, operand: operand.element, operator: '++' },
        dependencies: operand.dependencies,
        reservedNames: operand.reservedNames,
      }
    }
    case SyntaxKind.PostfixUnaryExpression: {
      const unary = node as PostfixUnaryExpression
      const operand = analyzeExpression({ ...args, node: unary.getOperand() })
      return {
        element: { kind: 'unary', prefix: false, operand: operand.element, operator: '++' },
        dependencies: operand.dependencies,
        reservedNames: operand.reservedNames,
      }
    }
    case SyntaxKind.YieldExpression: {
      const expression = (node as YieldExpression).getExpression()
      const expressionResult = expression
        ? analyzeExpression({ ...args, node: expression })
        : undefined
      return {
        element: { kind: 'yield', expression: expressionResult?.element },
        dependencies: expressionResult?.dependencies ?? [],
        reservedNames: expressionResult?.reservedNames ?? [],
      }
    }
    case SyntaxKind.NullKeyword:
      return {
        element: { kind: 'null' },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.ThisKeyword:
      return {
        element: {
          kind: 'this',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.SuperKeyword:
      return {
        element: {
          kind: 'super',
        },
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.Identifier:
      return {
        element: {
          kind: 'identifier',
          name: node.getText(),
        },
        dependencies: [analyzeDependency(node.getText(), args.imported, args.memberPath)],
        reservedNames: [],
      }
    case SyntaxKind.PropertyAccessExpression: {
      const prop: PropertyAccessExpression = node as PropertyAccessExpression
      const objKey = analyzeExpression({ ...args, node: prop.getExpression() })

      const dependencies: Array<DependencyCandidate> = [...objKey.dependencies]
      if (objKey.element.kind == 'this') {
        dependencies.push(analyzeDependency(prop.getName(), args.imported, args.memberPath))
      }
      return {
        element: {
          kind: 'property-access',
          object: objKey.element,
          optional: prop.getQuestionDotTokenNode() ? true : false,
          property: prop.getName(),
        },
        dependencies,
        reservedNames: [...objKey.reservedNames],
      }
    }
    case SyntaxKind.ElementAccessExpression: {
      const element: ElementAccessExpression = node as ElementAccessExpression
      const objResult = analyzeExpression({ ...args, node: element.getExpression() })
      const indexResult = analyzeExpression({ ...args, node: element.getArgumentExpression()! })
      return {
        element: {
          kind: 'computed-access',
          object: objResult.element,
          optional: element.getQuestionDotTokenNode() ? true : false,
          index: indexResult.element,
        },
        dependencies: [...objResult.dependencies, ...indexResult.dependencies],
        reservedNames: [...objResult.reservedNames, ...indexResult.reservedNames],
      }
    }
    case SyntaxKind.ObjectLiteralExpression: {
      const objectElement = node as ObjectLiteralExpression
      const properties = objectElement
        .getProperties()
        .map((prop) => analyzeProperty({ ...args, node: prop }))
      return {
        element: {
          kind: 'object-literal',
          properties: properties.map((p) => p.property),
        },
        dependencies: properties.map((p) => p.dependencies).flat(),
        reservedNames: properties.map((p) => p.reservedNames).flat(),
      }
    }
    // case SyntaxKind.ArrowFunction: {
    //   const functionResult = analyzeTypeFunction(
    //     { ...args, node: node as ArrowFunction },
    //     { name: '', jsDocableNode: node as ArrowFunction },
    //   )

    //   return {
    //     member: {
    //       source: 'typescript',
    //       text: '',
    //       structure: functionResult.member,
    //       generics: genericsParametersResult.member,
    //     },
    //     dependencies: [...functionResult.dependencies, ...genericsParametersResult.dependencies],
    //     reservedNames: [...functionResult.reservedNames, ...genericsParametersResult.reservedNames],
    //   }
    // }
    case SyntaxKind.NewExpression:
      return analyzeNewExpression(args, node as NewExpression)
    case SyntaxKind.CallExpression: {
      return analyzeCallExpression(args, node as CallExpression)
    }
    case SyntaxKind.AwaitExpression: {
      return analyzeAwaitExpression(args, node as AwaitExpression)
    }
    case SyntaxKind.BinaryExpression:
      return analyzeBinaryExpression(args, node as BinaryExpression)
    case SyntaxKind.ArrowFunction:
      return analyzeFunctionExpression(args, node as ArrowFunction)
    case SyntaxKind.AsExpression:
      return analyzeAsExpression(args, node as AsExpression)
    case SyntaxKind.TypeOfExpression:
      return analyzeTypeOfExpression(args, node as TypeOfExpression)
    default:
      console.log(`!!!!!Unsupported : ${node.getKindName()}`)
      // throw new Error('Place To Check')
      return {
        element: {
          kind: 'identifier',
          name: node.getText(),
        },
        dependencies: [],
        reservedNames: [],
      }
  }
}
