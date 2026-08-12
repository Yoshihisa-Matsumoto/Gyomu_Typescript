import { Node } from 'ts-morph'
import { analyzeCallExpression } from './analyzeCall.js'
import { analyzeNewExpression } from './analyzeNew.js'
import { analyzeReturnExpression } from './analyzeReturn.js'
import { analyzeBinaryExpression } from './analyzeBinary.js'
import type { Statement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  bodyStatement: Statement,
): FunctionBodyStatementAnalysisResult => {
  // console.log(bodyStatement.getKindName())

  if (Node.isExpressionStatement(bodyStatement)) {
    const expression = bodyStatement.getExpression()
    // console.log('ExpressionStatement', expression.getKindName(), expression.getText())
    if (Node.isCallExpression(expression)) {
      return analyzeCallExpression(args, expression)
    }
    if (Node.isNewExpression(expression)) {
      return analyzeNewExpression(args, expression)
    }
    if (Node.isBinaryExpression(expression)) {
      // const left = expression.getLeft()
      // const right = expression.getRight()
      // const leftDependencies = new Array<DependencyCandidate>()
      // const rightDependencies = new Array<DependencyCandidate>()
      // if (Node.isIdentifier(right)) {
      //   const rightText = right.getText()
      //   const dependency = analyzeDependency(rightText, args.imported, args.memberPath)
      //   rightDependencies.push(dependency)
      // }
      // if (Node.isPropertyAccessExpression(left)) {
      //   const expressionText = left.getExpression().getText()
      //   if (expressionText === 'this') {
      //     const leftName = left.getName()
      //     const dependency = analyzeDependency(leftName, args.imported, args.memberPath)
      //     leftDependencies.push(dependency)
      //   } else {
      //     const dependency = analyzeDependency(expressionText, args.imported, args.memberPath)
      //     leftDependencies.push(dependency)
      //   }
      // }
      // return {
      //   dependencies: [...leftDependencies, ...rightDependencies],
      //   reservedNames: [],
      //   element: { kind: 'binary' },
      // }
      return analyzeBinaryExpression(args, expression)
    }
  }
  if (Node.isReturnStatement(bodyStatement)) {
    return analyzeReturnExpression(args, bodyStatement)
    // const dependencies = new Array<DependencyCandidate>()
    // const funcExpression = bodyStatement.getExpression()
    // if (Node.isCallExpression(funcExpression)) {
    //   funcExpression.getArguments().forEach((arg) => {
    //     if (Node.isIdentifier(arg))
    //       dependencies.push(analyzeDependency(arg.getText(), args.imported, args.memberPath))
    //   })
    //   const identifier = funcExpression.getExpression()
    //   if (Node.isIdentifier(identifier))
    //     dependencies.push(analyzeDependency(identifier.getText(), args.imported, args.memberPath))
    // }
    // return {
    //   dependencies,
    //   element: { kind: 'return' },
    // }
  }
  return {
    dependencies: [],
    element: { kind: 'throw' }, // とりあえず適当に
    reservedNames: [],
  }
}
