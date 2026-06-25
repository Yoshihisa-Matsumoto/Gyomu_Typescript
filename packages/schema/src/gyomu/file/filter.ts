import { parse } from 'date-fns'
import type { FileCompareType, FilterType } from './types.js'

/**
 * Defines metadata for a file filter, including filter type, comparison operator, and target date.
 */
export class FileFilterInfo {
  /**
   * The type of the filter.
   */
  readonly kind: FilterType

  /**
   * The comparison operator used for filtering.
   */
  readonly operator: FileCompareType

  /**
   * The target date for the filter calculation.
   */
  readonly targetDate: Date

  /**
   * Constructs a new FileFilterInfo instance.
   *
   * @param kind The filter type.
   *
   * @param operator The comparison operator.
   *
   * @param filter The filter source string (yyyyMMdd) or date object.
   *
   * @returns A FileFilterInfo instance.
   */
  constructor(kind: FilterType, operator: FileCompareType, filter: string | Date) {
    this.kind = kind
    this.operator = operator
    {
      if (typeof filter === 'string') this.targetDate = parse(filter, 'yyyyMMdd', 0)
      else this.targetDate = filter
    }
  }
}
