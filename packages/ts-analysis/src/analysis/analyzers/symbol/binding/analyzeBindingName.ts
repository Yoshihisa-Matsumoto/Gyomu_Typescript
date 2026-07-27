import { Node } from 'ts-morph'
import { analyzeObjectBindingPattern } from './analyzeObjectBindingPattern.js'
import { analyzeArrayBindingPattern } from './analyzeArrayBindingPattern.js'
import type { ArrayBindingPattern, BindingName, ObjectBindingPattern } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { BindingPatternAnalysis } from '@gyomu/schema/schemas/typescript'

export const analyzeBindingName = (
  args: ChildAnalysisArg<BindingName>,
): MemberAnalysisWithReservedResult<BindingPatternAnalysis> => {
  const { node } = args

  if (Node.isObjectBindingPattern(node)) {
    return analyzeObjectBindingPattern({
      ...args,
      memberPath: [...args.memberPath, '$binding'],
    } as ChildAnalysisArg<ObjectBindingPattern>)
  }
  return analyzeArrayBindingPattern({
    ...args,
    memberPath: [...args.memberPath, '$binding'],
  } as ChildAnalysisArg<ArrayBindingPattern>)
}
