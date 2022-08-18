export const createDateOnly = (
  year: number,
  one_base_month: number,
  day: number
) => {
  const dateString = `${year}-${('00' + one_base_month).slice(-2)}-${(
    '00' + day
  ).slice(-2)}`;
  return new Date(dateString);
};

export const createDateFromYYYYMMDD = (yyyyMMdd: string) => {
  const dateString =
    yyyyMMdd.substring(0, 4) +
    '-' +
    yyyyMMdd.substring(4, 6) +
    '-' +
    yyyyMMdd.substring(6);
  return new Date(dateString);
};

export const extractDateOnly = (date: Date) => {
  const dateString = `${date.getFullYear()}-${(
    '00' +
    (date.getMonth() + 1)
  ).slice(-2)}-${('00' + date.getDate()).slice(-2)}`;
  return new Date(dateString);
};
