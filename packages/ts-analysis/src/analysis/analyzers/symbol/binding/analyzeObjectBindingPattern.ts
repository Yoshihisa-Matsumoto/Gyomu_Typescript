import { analyzeBindingElement } from './analyzeBindingElement.js'
import type { ObjectBindingPattern } from 'ts-morph'
import type { ChildAnalysisArg, MemberAnalysisWithReservedResult } from '../../types.js'
import type { BindingPatternAnalysis } from '@gyomu/schema/schemas/typescript'

/**
 * Analyzes an ObjectBindingPattern node, returning a structural analysis of its binding elements along with aggregated dependencies and reserved names.
 *
 * @param args The analysis context containing the object binding pattern node.
 *
 * @returns An analysis result containing the object binding pattern structure, dependencies, and reserved names found within its elements.
 */
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
