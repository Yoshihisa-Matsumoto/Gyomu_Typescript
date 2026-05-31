import { parse } from 'date-fns'
import type { FileCompareType, FilterType } from './types.js'

export class FileFilterInfo {
  readonly kind: FilterType
  readonly operator: FileCompareType
  readonly targetDate: Date
  constructor(kind: FilterType, operator: FileCompareType, filter: string | Date) {
    this.kind = kind
    this.operator = operator
    {
      if (typeof filter === 'string') this.targetDate = parse(filter, 'yyyyMMdd', 0)
      else this.targetDate = filter
    }
  }
}
