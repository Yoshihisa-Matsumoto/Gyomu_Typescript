import { Node } from 'ts-morph'
import { analyzeBindingElement } from './analyzeBindingElement.js'
import type { BindingPatternAnalysis } from '@gyomu/schema/schemas/typescript'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { ArrayBindingPattern } from 'ts-morph'

export const analyzeArrayBindingPattern = (
  args: ChildAnalysisArg<ArrayBindingPattern>,
): MemberAnalysisWithReservedResult<BindingPatternAnalysis> => {
  const { node } = args

  const elementsResult = node
    .getElements()
    .map((element, index) => {
      if (Node.isOmittedExpression(element)) return undefined
      return analyzeBindingElement(element, index, args)
    })
    .filter((e) => !!e)
  return {
    member: {
      pattern: 'array',
      elements: elementsResult.map((e) => e.member),
    },
    dependencies: elementsResult.map((d) => d.dependencies).flat(),
    reservedNames: elementsResult.map((d) => d.reservedNames).flat(),
  }
}
