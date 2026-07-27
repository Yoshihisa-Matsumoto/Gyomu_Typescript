import { analyzeBindingElement } from './analyzeBindingElement.js'
import type { ObjectBindingPattern } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { BindingPatternAnalysis } from '@gyomu/schema/schemas/typescript'

export const analyzeObjectBindingPattern = (
  args: ChildAnalysisArg<ObjectBindingPattern>,
): MemberAnalysisWithReservedResult<BindingPatternAnalysis> => {
  const { node } = args

  const elementsResult = node
    .getElements()
    .map((element, index) => analyzeBindingElement(element, index, args))
  return {
    member: {
      pattern: 'object',
      elements: elementsResult.map((e) => e.member),
    },
    dependencies: elementsResult.map((d) => d.dependencies).flat(),
    reservedNames: elementsResult.map((d) => d.reservedNames).flat(),
  }
}
