import { platform } from '../../platform';
import { CsvWriteOption } from './type';
import { stringify } from 'csv';
import { Options } from 'csv-stringify';
import { throughNodeStream } from '../nodeStream';
import { Stream } from '..';

type CsvValue = string | number | boolean | null | undefined;
type CsvRow = Record<string, CsvValue>;

export const writeCsv =
  <R extends CsvRow>(options?: CsvWriteOption<R>) =>
  (stream: Stream.Stream<R>) =>
    stream.pipe(
      throughNodeStream<R, string>(stringify(convertOption(options))),
    );
// export const writeCsv =
//   <R extends CsvRow>(options?: CsvWriteOption<R>) =>
//   (rows: Stream.Stream<R>): Stream.Stream<string, IOError> =>
//     Stream.async((emit) => {
//       const csvOptions = convertOption(options);
//       const stringifier = stringify(csvOptions);

//       const mapRow = options?.mapRow ?? ((x: R) => x);

//       stringifier.on('data', (chunk) => {
//         emit.single(chunk);
//       });

//       stringifier.on('end', () => {
//         emit.end();
//       });

//       stringifier.on('error', (err) => {
//         emit.fail(unknownError(IOError, err, 'CSV write error'));
//       });

//       const writeRow = (row: R) =>
//         Effect.async<void, Error>((resume) => {
//           const ok = stringifier.write(mapRow(row));

//           if (ok) {
//             resume(Effect.succeed(undefined));
//           } else {
//             stringifier.once('drain', () => {
//               resume(Effect.succeed(undefined));
//             });
//           }
//         });

//       Effect.runFork(
//         Stream.runForEach(rows, writeRow).pipe(
//           Effect.tap(() => Effect.sync(() => stringifier.end())),
//         ),
//       );

//       return Effect.sync(() => stringifier.end());
//     });

const convertOption = <R>(options?: CsvWriteOption<R>): Options => {
  const csvOptions: Options = {
    header: true,
    quoted: options?.quoted ?? false,
    bom: options?.bom ?? false,
    record_delimiter: platform.name == 'linux' ? 'unix' : 'windows',
  };
  // if (options?.fields) {
  //   csvOptions.columns = Object.values(options.fields);
  // }
  return csvOptions;
};
