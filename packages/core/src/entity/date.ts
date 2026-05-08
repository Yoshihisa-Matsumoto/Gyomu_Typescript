import { format, parse, isValid } from 'date-fns';
import { ValueError } from '../error/ValueError.js';
import { Schema } from 'effect';
import { isPattern } from 'effect/Schema';

export const LocalDateSchema = Schema.String.pipe(
  Schema.check(isPattern(/^\d{4}-\d{2}-\d{2}$/)),
  Schema.brand('LocalDate'),
);

export const YearMonthSchema = Schema.String.pipe(
  Schema.check(isPattern(/^\d{4}-\d{2}$/)),
  Schema.brand('YearMonth'),
);

export const TargetDateSchema = Schema.TaggedUnion({
  daily: {
    type: Schema.Literal('daily'),
    date: LocalDateSchema,
  },
  monthly: {
    type: Schema.Literal('monthly'),
    month: YearMonthSchema,
  },
});

export type LocalDate = string & Schema.Schema<typeof LocalDateSchema>;
export type YearMonth = string & Schema.Schema<typeof YearMonthSchema>;
export type TargetDate = Schema.Schema<typeof TargetDateSchema>;
export const LocalDate = {
  make: (s: string) => Schema.decodeSync(LocalDateSchema)(s),
};

export const LocalDate2Date = (localDate: LocalDate): Date => {
  const [y, m, d] = localDate.split('-').map(Number);
  return new Date(y!, m! - 1, d);
};

export const Date2LocalDate = (date: Date): LocalDate => {
  return format(date, 'yyyy-MM-dd') as LocalDate;
};

export const createDateOnly = (
  year: number,
  one_base_month: number,
  day: number,
) => {
  const dateString = `${year}-${('00' + one_base_month).slice(-2)}-${(
    '00' + day
  ).slice(-2)}`;
  return new Date(dateString);
};

export const extractDateOnly = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export function formatDateToYmd(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
export function parseYmdToDate(ymd: string): Date {
  const date = parse(ymd, 'yyyy-MM-dd', new Date());
  if (!isValid(date) || format(date, 'yyyy-MM-dd') !== ymd) {
    throw new ValueError({
      message: 'invalid date format',
      field: 'ymd',
      value: ymd,
      expected: 'yyyy-MM-dd',
      cause: undefined,
    });
  }
  return date;
}
