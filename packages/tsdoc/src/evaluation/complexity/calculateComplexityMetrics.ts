import { mergeComplexityMetrics } from './mergeComplexityMetrics.js'
import { emptyComplexityMetrics } from './emptyComplexityMetrics.js'
import { computeEffectComplexity } from './computeEffectComplexity.js'
import type {
  DocumentableMethodMemberAnalysis,
  DocumentablePropertyMemberAnalysis,
  MemberAnalysis,
  SymbolAnalysis,
  SymbolId,
  TypeAnalysis,
  TypeStructureAnalysis,
} from '@gyomu/schema/typescript'
import type { FileAnalysisResult } from '../../analysis/file/FileAnalysisResult.js'

import type { ComplexityMetrics } from './ComplexityMetrics.js'

export const calculateComplexityMetrics = (
  fileAnalysisResult: FileAnalysisResult,
): Map<SymbolId, ComplexityMetrics> => {
  const map = new Map<SymbolId, ComplexityMetrics>()
  for (const symbol of fileAnalysisResult.analysis.exports) {
    map.set(symbol.symbol.id, calculateComplexityMetricsFromSymbol(symbol.symbol))
  }
  return map
}

const calculateComplexityMetricsFromSymbol = (symbol: SymbolAnalysis): ComplexityMetrics => {
  const metricsArray: Array<ComplexityMetrics> = []

  const initial = emptyComplexityMetrics()
  initial.parameterCount = symbol.members.length
  metricsArray.push(initial)
  if (symbol.type) metricsArray.push(calculateComplexityMetricsFromTypeAnalysis(symbol.type, 0))

  metricsArray.push(calculateComplexityMetricsFromMembers(symbol.members, 0))
  return mergeComplexityMetrics(metricsArray)
}

const calculateComplexityMetricsFromMembers = (
  members: Array<MemberAnalysis>,
  currentDepth: number,
): ComplexityMetrics => {
  const metricsArray: Array<ComplexityMetrics> = []
  for (const member of members) {
    if (!member.documentable) continue
    if (member.kind == 'method')
      metricsArray.push(calculateComplexityMetricsFromMethod(member, currentDepth))
    else metricsArray.push(calculateComplexityMetricsFromProperty(member, currentDepth))
  }

  return mergeComplexityMetrics(metricsArray)
}

const calculateComplexityMetricsFromMethod = (
  method: DocumentableMethodMemberAnalysis,
  currentDepth: number,
): ComplexityMetrics => {
  currentDepth++
  const metricsArray: Array<ComplexityMetrics> = []

  if (method.returnType) {
    const methodReturnMetrics = calculateComplexityMetricsFromTypeAnalysis(
      method.returnType,
      currentDepth,
    )
    const methodDepth = methodReturnMetrics.nestingDepth - currentDepth
    methodReturnMetrics.returnTypeDepth = methodDepth
    metricsArray.push(methodReturnMetrics)
  }
  metricsArray.push(calculateComplexityMetricsFromMembers(method.parameters, currentDepth))
  return mergeComplexityMetrics(metricsArray)
}

const calculateComplexityMetricsFromProperty = (
  property: DocumentablePropertyMemberAnalysis,
  currentDepth: number,
): ComplexityMetrics => {
  const metricsArray: Array<ComplexityMetrics> = []
  currentDepth++
  const initial = emptyComplexityMetrics()
  if (property.optional) initial.optionalCount += 1
  metricsArray.push(initial)
  if (property.type) {
    metricsArray.push(calculateComplexityMetricsFromTypeAnalysis(property.type, currentDepth))
  }
  return mergeComplexityMetrics(metricsArray)
}

const calculateComplexityMetricsFromTypeAnalysis = (
  typeAnalysis: TypeAnalysis,
  currentDepth: number,
): ComplexityMetrics => {
  currentDepth++
  const metricsArray: Array<ComplexityMetrics> = []
  const initial = emptyComplexityMetrics()
  initial.nestingDepth = currentDepth
  if (typeAnalysis.effect) {
    initial.effectComplexity = computeEffectComplexity(typeAnalysis.effect)
  }
  if (typeAnalysis.source == 'effect-schema') initial.schemaComplexity = 5

  metricsArray.push(initial)

  if (typeAnalysis.structure) {
    metricsArray.push(
      calculateComplexityMetricsFromTypeStructureAnalysis(typeAnalysis.structure, currentDepth),
    )
  }
  return mergeComplexityMetrics(metricsArray)
}

const calculateComplexityMetricsFromTypeStructureAnalysis = (
  typeStructure: TypeStructureAnalysis,
  currentDepth: number,
): ComplexityMetrics => {
  currentDepth++
  const array: Array<ComplexityMetrics> = []
  const initial = emptyComplexityMetrics()
  initial.nestingDepth = currentDepth

  switch (typeStructure.kind) {
    case 'array':
      return calculateComplexityMetricsFromTypeAnalysis(typeStructure.elementType, currentDepth)
    case 'function':
      return calculateComplexityMetricsFromMembers(typeStructure.parameters, currentDepth)
    case 'object':
      if (typeStructure.members)
        return calculateComplexityMetricsFromMembers(typeStructure.members, currentDepth)
      return emptyComplexityMetrics()
    case 'reference':
      initial.referencedTypeCount = 1
      return initial
    case 'literal':
    case 'primitive':
      return initial
    case 'union':
      initial.unionCount = typeStructure.types.length
      array.push(initial)
      for (const typeAnalysis of typeStructure.types) {
        array.push(calculateComplexityMetricsFromTypeAnalysis(typeAnalysis, currentDepth))
      }
      return mergeComplexityMetrics(array)
  }
}
