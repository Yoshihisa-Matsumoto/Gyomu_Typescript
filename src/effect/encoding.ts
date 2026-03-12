import { decode } from '../encoding/decode';
import { Stream } from './index';

export const decodeText =
  (encoding: BufferEncoding | string) =>
  <E, R>(stream: Stream.Stream<string | Buffer, E, R>) =>
    stream.pipe(
      Stream.map((chunk) => {
        if (typeof chunk === 'string') {
          return chunk;
        } else {
          return decode(chunk, encoding);
        }
      }),
    );
