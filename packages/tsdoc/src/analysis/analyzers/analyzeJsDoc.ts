import type { JsDocAnalysis, ParsedJsDoc } from '@gyomu/schema/typescript'

export const analyzeJsDoc = (parsedList: ReadonlyArray<ParsedJsDoc>): JsDocAnalysis => {
  const exists = parsedList.length > 0

  const summaryLength = parsedList.reduce((sum, parsed) => {
    return sum + (parsed.summary?.length ?? 0)
  }, 0)

  const hasSummary = parsedList.some((parsed) => {
    return !!parsed.summary
  })

  const hasRemarks = parsedList.some((parsed) => {
    return !!parsed.remarks
  })

  const exampleCount = parsedList.reduce((sum, parsed) => {
    return sum + parsed.examples.length
  }, 0)

  const hasDeprecated = parsedList.some((parsed) => {
    return !!parsed.deprecated
  })

  const paramCount = parsedList.reduce((sum, parsed) => {
    return sum + parsed.params.length
  }, 0)

  const hasReturnTag = parsedList.some((parsed) => {
    return !!parsed.returns
  })

  const throwsCount = parsedList.reduce((sum, parsed) => {
    return sum + parsed.throws.length
  }, 0)

  const templateCount = parsedList.reduce((sum, parsed) => {
    return sum + parsed.templates.length
  }, 0)

  const tagCount = parsedList.reduce((sum, parsed) => {
    return sum + parsed.tags.length
  }, 0)

  const hasHumanEditedSections = parsedList.some((parsed) => {
    return parsed.humanEditSignals.length > 0
  })

  const hasProtectedRegion = parsedList.some((parsed) => {
    return parsed.protectedRegions.length > 0
  })

  const generators = parsedList.flatMap((parsed) => {
    return parsed.generator ? [parsed.generator] : []
  })

  return {
    exists,

    summaryLength,

    hasSummary,

    hasRemarks,

    exampleCount,

    hasDeprecated,

    paramCount,

    hasReturnTag,

    throwsCount,

    templateCount,

    tagCount,

    hasHumanEditedSections,

    hasProtectedRegion,

    generators,
  }
}
