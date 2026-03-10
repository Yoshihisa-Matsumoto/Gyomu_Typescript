// import { Stream } from '../effect';
// import { IOError, unknownError } from '../errors';
// import { CsvReadOption } from './type';

// export const CsvStreamRows = (
//   source: AsyncIterable<Record<string, string>>,
//   option?: Pick<CsvReadOption, 'filterFn'>,
// ): Stream.Stream<Record<string, string>, IOError, never> => {
//   return Stream.fromAsyncIterable(source, (e) =>
//     unknownError(IOError, e, 'CSV parse error'),
//   ).pipe(
//     Stream.map((row) => row as Record<string, string>),
//     Stream.filter((record) => !option?.filterFn || option.filterFn(record)),
//   );
// };
