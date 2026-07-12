import { equalSymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'
import { mergeComplexityMetrics } from './mergeComplexityMetrics.js'
import { emptyComplexityMetrics } from './emptyComplexityMetrics.js'
import { computeEffectComplexity } from './computeEffectComplexity.js'
import type { FileAnalysisContext, SymbolId } from '@gyomu/schema/typescript'
import type {
  DocumentableMethodMemberAnalysis,
  DocumentablePropertyMemberAnalysis,
  IndexSignatureAnalysis,
  MemberAnalysis,
  SymbolAnalysis,
  TypeAnalysis,
  TypeProperty,
  TypeStructureAnalysis,
} from '@gyomu/schema/schemas/typescript'

import type { ComplexityMetrics } from './ComplexityMetrics.js'

export const calculateComplexityMetrics = (
  fileAnalysisResult: FileAnalysisContext,
): Map<SymbolId, ComplexityMetrics> => {
  const map = new Map<SymbolId, ComplexityMetrics>()
  for (const exportItem of fileAnalysisResult.analysis.exports.filter((e) => e.kind == 'local')) {
    const symbol = fileAnalysisResult.analysis.symbols.find((s) =>
      equalSymbolIdentity(s.identity, exportItem.identity),
    )
    if (symbol) map.set(symbol.id, calculateComplexityMetricsFromSymbol(symbol))
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
  members: ReadonlyArray<MemberAnalysis>,
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

const calculateComplexityMetricsFromTypeProperties = (
  members: ReadonlyArray<TypeProperty>,
  currentDepth: number,
): ComplexityMetrics => {
  currentDepth++
  const metricsArray: Array<ComplexityMetrics> = []
  for (const member of members) {
    if (member.type)
      metricsArray.push(calculateComplexityMetricsFromTypeAnalysis(member.type, currentDepth))
  }

  return mergeComplexityMetrics(metricsArray)
}

const calculateComplexityMetricsFromIndexSignatures = (
  members: ReadonlyArray<IndexSignatureAnalysis>,
  currentDepth: number,
): ComplexityMetrics => {
  currentDepth++
  const metricsArray: Array<ComplexityMetrics> = []
  for (const member of members) {
    metricsArray.push(calculateComplexityMetricsFromIndexSignature(member, currentDepth))
  }

  return mergeComplexityMetrics(metricsArray)
}

const calculateComplexityMetricsFromTypeAnalysisMembers = (
  members: ReadonlyArray<TypeAnalysis>,
  currentDepth: number,
): ComplexityMetrics => {
  currentDepth++
  const metricsArray: Array<ComplexityMetrics> = []
  for (const member of members) {
    metricsArray.push(calculateComplexityMetricsFromTypeAnalysis(member, currentDepth))
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

const calculateComplexityMetricsFromIndexSignature = (
  indexSignature: IndexSignatureAnalysis,
  currentDepth: number,
): ComplexityMetrics => {
  currentDepth++
  const metricsArray: Array<ComplexityMetrics> = []
  const initial = emptyComplexityMetrics()
  initial.nestingDepth = currentDepth

  metricsArray.push(initial)

  metricsArray.push(
    calculateComplexityMetricsFromTypeAnalysis(indexSignature.parameterType, currentDepth),
  )
  metricsArray.push(calculateComplexityMetricsFromTypeAnalysis(indexSignature.type, currentDepth))

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
      return calculateComplexityMetricsFromTypeProperties(typeStructure.parameters, currentDepth)
    case 'object':
      if (typeStructure.properties)
        return calculateComplexityMetricsFromTypeProperties(typeStructure.properties, currentDepth)
      if (typeStructure.indexSignatures)
        return calculateComplexityMetricsFromIndexSignatures(
          typeStructure.indexSignatures,
          currentDepth,
        )
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
    case 'conditional':
      array.push(initial)
      array.push(calculateComplexityMetricsFromTypeAnalysis(typeStructure.checkType, currentDepth))
      array.push(
        calculateComplexityMetricsFromTypeAnalysis(typeStructure.extendsType, currentDepth),
      )
      array.push(calculateComplexityMetricsFromTypeAnalysis(typeStructure.trueType, currentDepth))
      array.push(calculateComplexityMetricsFromTypeAnalysis(typeStructure.falseType, currentDepth))
      return mergeComplexityMetrics(array)
    case 'constructor':
      array.push(initial)
      array.push(
        calculateComplexityMetricsFromTypeProperties(typeStructure.parameters, currentDepth),
      )
      if (typeStructure.returnType)
        array.push(
          calculateComplexityMetricsFromTypeAnalysis(typeStructure.returnType, currentDepth),
        )
      return mergeComplexityMetrics(array)
    case 'generics':
      return calculateComplexityMetricsFromTypeAnalysisMembers(
        typeStructure.typeParameters,
        currentDepth,
      )
    case 'parenthesized':
    case 'optional':
    case 'rest':
    case 'namedTupleMember':
      return calculateComplexityMetricsFromTypeAnalysis(typeStructure.type, currentDepth)
    case 'this':
      return initial
    case 'import':
      return calculateComplexityMetricsFromTypeAnalysisMembers(
        typeStructure.typeArguments,
        currentDepth,
      )
    case 'indexedAccess':
      array.push(initial)
      array.push(calculateComplexityMetricsFromTypeAnalysis(typeStructure.indexType, currentDepth))
      array.push(calculateComplexityMetricsFromTypeAnalysis(typeStructure.objectType, currentDepth))
      return mergeComplexityMetrics(array)
    case 'infer':
      array.push(initial)
      if (typeStructure.constraint)
        array.push(
          calculateComplexityMetricsFromTypeAnalysis(typeStructure.constraint, currentDepth),
        )

      return mergeComplexityMetrics(array)
    case 'mapped':
      array.push(initial)
      array.push(calculateComplexityMetricsFromTypeAnalysis(typeStructure.constraint, currentDepth))
      if (typeStructure.nameType)
        array.push(calculateComplexityMetricsFromTypeAnalysis(typeStructure.nameType, currentDepth))
      array.push(calculateComplexityMetricsFromTypeAnalysis(typeStructure.valueType, currentDepth))
      return mergeComplexityMetrics(array)
    case 'templateLiteral': {
      array.push(initial)
      const spans = typeStructure.spans.filter((span) => typeof span != 'string')
      array.push(calculateComplexityMetricsFromTypeAnalysisMembers(spans, currentDepth))
      return mergeComplexityMetrics(array)
    }
    case 'tuple':
      array.push(initial)
      array.push(calculateComplexityMetricsFromTypeProperties(typeStructure.elements, currentDepth))
      return mergeComplexityMetrics(array)
    case 'typeOperator':
      return calculateComplexityMetricsFromTypeAnalysis(typeStructure.target, currentDepth)
    case 'typePredicate':
      return calculateComplexityMetricsFromTypeAnalysis(typeStructure.type, currentDepth)
  }
}
