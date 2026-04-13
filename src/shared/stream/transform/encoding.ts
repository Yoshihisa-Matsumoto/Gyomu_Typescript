import { Stream } from 'effect';
import { decode } from '../../../encoding/decode.js';

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

export const encodeUtf8ToBinaryStream = <E, R>(
  stream: Stream.Stream<string, E, R>,
) => stream.pipe(Stream.map((s) => new TextEncoder().encode(s)));
