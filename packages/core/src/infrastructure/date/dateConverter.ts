import { format, parse, isValid } from 'date-fns';
import { ValueError } from '@gyomu/shared';

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
// export const createDateFromYYYYMMDD = (yyyyMMdd: string) => {
//   const dateString =
//     yyyyMMdd.substring(0, 4) +
//     '-' +
//     yyyyMMdd.substring(4, 6) +
//     '-' +
//     yyyyMMdd.substring(6);
//   return new Date(dateString);
// };

export const extractDateOnly = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export function formatDateToYmd(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
export function parseYmdToDate(ymd: string): Date {
  const date = parse(ymd, 'yyyy-MM-dd', new Date());
  if (!isValid(date) || format(date, 'yyyy-MM-dd') !== ymd) {
    throw new ValueError(`Invalid date string: ${ymd}`);
  }
  return date;
}
