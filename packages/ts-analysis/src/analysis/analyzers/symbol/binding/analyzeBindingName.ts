import { Node } from 'ts-morph'
import { analyzeObjectBindingPattern } from './analyzeObjectBindingPattern.js'
import { analyzeArrayBindingPattern } from './analyzeArrayBindingPattern.js'
import type { ArrayBindingPattern, BindingName, ObjectBindingPattern } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type {
  BindingPatternAnalysis,
  IdentifierExpressionAnalysis,
} from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes a TypeScript binding name by dispatching to the appropriate analyzer for object or array binding patterns.
 *
 * @param args The context object containing the binding name node and analysis state.
 *
 * @returns The analysis result for the binding pattern.
 */
export const analyzeBindingName = (
  args: ChildAnalysisArg<BindingName>,
): MemberAnalysisWithReservedResult<BindingPatternAnalysis | IdentifierExpressionAnalysis> => {
  const { node } = args

  if (Node.isObjectBindingPattern(node)) {
    return analyzeObjectBindingPattern({
      ...args,
      memberPath: [...args.memberPath, '$binding'],
    } as ChildAnalysisArg<ObjectBindingPattern>)
  }
  if (Node.isIdentifier(node)) {
    return {
      member: { kind: 'identifier', name: node.getText() },
      dependencies: [],
      reservedNames: [],
    }
  }
  return analyzeArrayBindingPattern({
    ...args,
    memberPath: [...args.memberPath, '$binding'],
  } as ChildAnalysisArg<ArrayBindingPattern>)
}
