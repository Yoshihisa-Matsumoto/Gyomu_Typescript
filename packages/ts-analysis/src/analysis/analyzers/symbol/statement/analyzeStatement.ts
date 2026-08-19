import { Node } from 'ts-morph'
import { analyzeCallExpression } from './analyzeCall.js'
import { analyzeNewExpression } from './analyzeNew.js'
import { analyzeReturnStatement } from './analyzeReturn.js'
import { analyzeBinaryExpression } from './analyzeBinary.js'
import { analyzeVariableStatement } from './analyzeVariable.js'
import { analyzeThrowStatement } from './analyzeThrow.js'
import { analyzeAwaitExpression } from './analyzeAwait.js'
import { analyzeIfStatement } from './analyzeIf.js'
import { analyzeBlockStatement } from './analyzeBlock.js'
import { analyzeSwitchStatement } from './analyzeSwitch.js'
import { analyzeForStatement, analyzeNormalForStatement } from './analyzeFor.js'
import { analyzeExpression } from './analyzeExpression.js'
import { analyzeWhileStatement } from './analyzeWhile.js'
import { analyzeTryStatement } from './analyzeTry.js'
import type { Statement } from 'ts-morph'
import type {
  ChildAnalysisArg,
  ExpressionAnalysisResult,
  FunctionBodyStatementAnalysisResult,
  FunctionLikeNodeType,
} from '../../types.js'

export const analyzeStatement = (
  args: ChildAnalysisArg<FunctionLikeNodeType>,
  bodyStatement: Statement,
): FunctionBodyStatementAnalysisResult => {
  // console.log(bodyStatement.getKindName())

  if (Node.isVariableStatement(bodyStatement)) {
    return analyzeVariableStatement(args, bodyStatement)
  }
  if (Node.isExpressionStatement(bodyStatement)) {
    const expression = bodyStatement.getExpression()
    // console.log('ExpressionStatement', expression.getKindName(), expression.getText())
    if (Node.isCallExpression(expression)) {
      return toFunctionBodyStatementAnalysisResult(analyzeCallExpression(args, expression))
    }
    if (Node.isNewExpression(expression)) {
      return toFunctionBodyStatementAnalysisResult(analyzeNewExpression(args, expression))
    }
    if (Node.isAwaitExpression(expression)) {
      return toFunctionBodyStatementAnalysisResult(analyzeAwaitExpression(args, expression))
    }
    if (Node.isBinaryExpression(expression)) {
      return toFunctionBodyStatementAnalysisResult(analyzeBinaryExpression(args, expression))
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
    }
  }

  if (Node.isBreakStatement(bodyStatement)) {
    return {
      elements: [{ kind: 'break' }],
      dependencies: [],
      reservedNames: [],
    }
  }
  if (Node.isContinueStatement(bodyStatement)) {
    return {
      elements: [{ kind: 'continue' }],
      dependencies: [],
      reservedNames: [],
    }
  }

  if (Node.isExpressionStatement(bodyStatement)) {
    const expressionResult = analyzeExpression({ ...args, node: bodyStatement.getExpression() })
    return {
      elements: [{ kind: 'expression-statement', expression: expressionResult.element }],
      dependencies: expressionResult.dependencies,
      reservedNames: expressionResult.reservedNames,
    }
  }
  if (Node.isReturnStatement(bodyStatement)) {
    return analyzeReturnStatement(args, bodyStatement)
  }
  if (Node.isThrowStatement(bodyStatement)) {
    return analyzeThrowStatement(args, bodyStatement)
  }
  if (Node.isIfStatement(bodyStatement)) {
    return analyzeIfStatement(args, bodyStatement)
  }
  if (Node.isBlock(bodyStatement)) {
    return analyzeBlockStatement(args, bodyStatement)
  }
  if (Node.isSwitchStatement(bodyStatement)) return analyzeSwitchStatement(args, bodyStatement)

  if (Node.isForOfStatement(bodyStatement) || Node.isForInStatement(bodyStatement))
    return analyzeForStatement(args, bodyStatement)
  if (Node.isForStatement(bodyStatement)) return analyzeNormalForStatement(args, bodyStatement)
  if (Node.isWhileStatement(bodyStatement)) return analyzeWhileStatement(args, bodyStatement)
  if (Node.isTryStatement(bodyStatement)) return analyzeTryStatement(args, bodyStatement)

  console.log(`!!!Unsupported Statement: ${bodyStatement.getKindName()}`)
  return {
    dependencies: [],
    elements: [{ kind: 'string-literal', value: '!!!DUMMY!!!' }], // とりあえず適当に
    reservedNames: [],
  }
}

export const toFunctionBodyStatementAnalysisResult = (
  expression: ExpressionAnalysisResult,
): FunctionBodyStatementAnalysisResult => ({
  elements: [expression.element],
  dependencies: expression.dependencies,
  reservedNames: expression.reservedNames,
})
