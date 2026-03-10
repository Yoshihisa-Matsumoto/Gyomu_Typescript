import { Stream } from '..';
import { IOError, unknownError } from '../../errors';

export function csvRows(rows: AsyncIterable<Record<string, string>>) {
  return Stream.fromAsyncIterable(rows, (e) =>
    unknownError(IOError, e, 'CSV parse error'),
  );
}
