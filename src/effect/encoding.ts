import { decode } from '../encoding/decode.js';
import { Stream } from 'effect';

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
