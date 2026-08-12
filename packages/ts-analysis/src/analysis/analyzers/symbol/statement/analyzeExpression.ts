import { SyntaxKind } from 'ts-morph'
import { analyzeGenericsParameters } from '../type/analyzeGenericsParameters.js'
import { analyzeProperty } from './analyzeProperty.js'
import { analyzeCallExpression } from './analyzeCall.js'
import { analyzeNewExpression } from './analyzeNew.js'
import type {
  CallExpression,
  ElementAccessExpression,
  Expression,
  NewExpression,
  NumericLiteral,
  ObjectLiteralExpression,
  PropertyAccessExpression,
  StringLiteral,
} from 'ts-morph'
import type { ChildAnalysisArg, ExpressionAnalysisResult } from '../../types.js'

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
        dependencies: [],
        reservedNames: [],
      }
    case SyntaxKind.PropertyAccessExpression: {
      const prop: PropertyAccessExpression = node as PropertyAccessExpression
      const objKey = analyzeExpression({ ...args, node: prop.getExpression() })

      return {
        element: {
          kind: 'property-access',
          object: objKey.element,
          optional: prop.getQuestionDotTokenNode() ? true : false,
          property: prop.getName(),
        },
        dependencies: [...objKey.dependencies],
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
      // const callExpression = node as CallExpression
      // const expression = analyzeExpression({ ...args, node: callExpression.getExpression() })
      // const callArguments: Array<ExpressionAnalysisResult> = callExpression
      //   .getArguments()
      //   .map((arg) => {
      //     if (Node.isExpression(arg)) return analyzeExpression({ ...args, node: arg })
      //     return undefined
      //   })
      //   .filter((e) => !!e)

      // return {
      //   expression: {
      //     kind: 'call',
      //     callee: expression.expression,
      //     arguments: callArguments.map((a) => a.expression),
      //     optional: callExpression.getQuestionDotTokenNode() ? true : false,
      //   },
      //   dependencies: [
      //     ...expression.dependencies,
      //     ...callArguments.map((a) => a.dependencies).flat(),
      //   ],
      //   reservedNames: [
      //     ...expression.reservedNames,
      //     ...callArguments.map((a) => a.reservedNames).flat(),
      //   ],
      // }
      // console.log('CallExpression Not handled')
      // console.dir(node, { depth: null })
      break
    }
    default:
      console.log(`!!!!!Unsupported : ${node.getKindName()}`)
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
