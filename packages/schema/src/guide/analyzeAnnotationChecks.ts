import type { Check, Checks } from 'effect/SchemaAST'
import type { Logger } from '../gyomu/logger/Logger.js'

/**
 * Analyzes a collection of annotation checks and aggregates their attributes into a single record.
 *
 * @param tag The annotation tag to be processed.
 *
 * @param checks The list of checks to analyze.
 *
 * @param logger Optional logger instance for reporting.
 *
 * @returns A record containing the aggregated attributes derived from all checks.
 */
export const analyzeAnnotationChecks = (tag: string, checks: Checks, logger?: Logger) => {
  const attributes: Record<string, any> = {}
  for (const item of checks) {
    const check: Check<any> = item

    Object.assign(attributes, analyzeAnnotationCheck(tag, check, logger))
  }
  return attributes
}
const analyzeAnnotationCheck = (tag: string, check: Check<any>, logger?: Logger) => {
  const attributes: Record<string, any> = {}
  if (check.annotations) {
    logger?.debug(check.annotations, 'Check Annotation exists')

    if (check.annotations.arbitrary?.constraint) {
      // console.dir(check.annotations.arbitrary, { depth: null })
      // console.dir(check.annotations.arbitrary.constraint, { depth: null })
      const constraint = check.annotations.arbitrary.constraint
      {
        const parent = check.annotations.identifier ?? tag.toLowerCase()

        // if (constraint.maxLength) attributes[`${parent}-maxLength`] = constraint.maxLength
        // if (constraint.minLength) attributes[`${parent}-minLength`] = constraint.minLength

        if (constraint.valid != undefined) attributes[`${parent}-valid`] = constraint.valid

        if (constraint.integer) attributes[`${parent}-isInteger`] = constraint.integer
        if (constraint.noNaN) attributes[`${parent}-noNaN`] = constraint.noNaN
        if (constraint.noInfinity) attributes[`${parent}-noInfinity`] = constraint.noInfinity
        if (constraint.unique) attributes[`${parent}-unique`] = constraint.unique
        if (constraint.patterns) attributes[`${parent}-patterns`] = constraint.patterns
        // if (constraint.ordered) attributes[`${parent}-ordered`] = constraint.ordered
      }
    }
  }
  if (check.annotations?.meta) {
    const meta = check.annotations.meta
    const parent = check.annotations.identifier ?? tag.toLowerCase()
    switch (meta._tag) {
      case 'isLessThanOrEqualTo':
      case 'isLessThanOrEqualToBigInt':
        attributes[`${parent}-max`] = meta.maximum
        break
      case 'isGreaterThanOrEqualTo':
      case 'isGreaterThanOrEqualToBigInt':
        attributes[`${parent}-min`] = meta.minimum
        break
      case 'isMinLength':
        attributes[`${parent}-minLength`] = meta.minLength
        break
      case 'isMaxLength':
        attributes[`${parent}-maxLength`] = meta.maxLength
        break
    }
  }

  // TODO: Somehow AST & parser has different type
  if ((check.annotations as any).toArbitraryConstraint) {
    const constraint = (check.annotations as any).toArbitraryConstraint
    if (constraint.array) {
      const parent = 'array'
      if (constraint.array.maxLength) attributes[`${parent}-maxLength`] = constraint.array.maxLength
      if (constraint.array.minLength) attributes[`${parent}-minLength`] = constraint.array.minLength
      if (constraint.array.size) attributes[`${parent}-size`] = constraint.array.size
    } else if (constraint.bigint) {
      const parent = 'bigint'
      if (constraint.bigint.max) attributes[`${parent}-max`] = constraint.bigint.max
      if (constraint.bigint.min) attributes[`${parent}-min`] = constraint.bigint.min
    } else if (constraint.date) {
      const parent = 'date'
      if (constraint.date.max) attributes[`${parent}-max`] = constraint.date.max
      if (constraint.date.min) attributes[`${parent}-min`] = constraint.date.min
      if (constraint.date.noInvalidDate)
        attributes[`${parent}-noInvalidDate`] = constraint.date.noInvalidDate
    } else if (constraint.number) {
      const parent = 'number'
      if (constraint.number.isInteger)
        attributes[`${parent}-isInteger`] = constraint.number.isInteger
      if (constraint.number.max) attributes[`${parent}-max`] = constraint.number.max
      if (constraint.number.maxExcluded)
        attributes[`${parent}-maxExcluded`] = constraint.number.maxExcluded
      if (constraint.number.min) attributes[`${parent}-min`] = constraint.number.min
      if (constraint.number.minExcluded)
        attributes[`${parent}-minExcluded`] = constraint.number.minExcluded
      if (constraint.number.noInteger)
        attributes[`${parent}-noInteger`] = constraint.number.noInteger
      if (constraint.number.noDefaultInfinity)
        attributes[`${parent}-noDefaultInfinity`] = constraint.number.noDefaultInfinity
      if (constraint.number.noNaN) attributes[`${parent}-noNaN`] = constraint.number.noNaN
    } else if (constraint.string) {
      const parent = 'string'
      if (constraint.string.maxLength)
        attributes[`${parent}-maxLength`] = constraint.string.maxLength
      if (constraint.string.minLength)
        attributes[`${parent}-minLength`] = constraint.string.minLength
      if (constraint.string.patterns) attributes[`${parent}-patterns`] = constraint.string.patterns
      if (constraint.string.size) attributes[`${parent}-size`] = constraint.string.size
    }
  }

  // Object.assign(attributes, check.annotations)

  return attributes
}
