import { parse } from 'date-fns';
import { ValueError } from '../../errors.js';
import { FilterType, FileCompareType } from './type.js';

export class FileFilterInfo {
  readonly kind: FilterType;
  readonly operator: FileCompareType;
  readonly nameFilter: string;
  readonly targetDate: Date;
  constructor(
    kind: FilterType,
    operator: FileCompareType,
    filter: string | Date,
  ) {
    this.kind = kind;
    this.operator = operator;
    if (this.kind === FilterType.FileName && typeof filter === 'string') {
      this.nameFilter = filter;
      this.targetDate = new Date();
    } else if (this.kind !== FilterType.FileName) {
      this.nameFilter = '';
      if (typeof filter === 'string')
        this.targetDate = parse(filter, 'yyyyMMdd', 0);
      else this.targetDate = filter;
    } else {
      throw new ValueError('Date Parameter is invalid:' + filter);
    }
  }
}
