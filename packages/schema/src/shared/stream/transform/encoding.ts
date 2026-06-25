import { Stream } from 'effect'
import { decode } from '../../encoding/decode.js'

/**
 * Decodes a stream of strings or buffers into a stream of strings using the specified text encoding.
 *
 * @param encoding The text encoding to use for buffers.
 *
 * @param stream The input stream containing strings or buffers.
 *
 * @returns A stream of decoded strings.
 */
export const decodeText =
  (encoding: BufferEncoding | string) =>
  <E, R>(stream: Stream.Stream<string | Buffer, E, R>) =>
    stream.pipe(
      Stream.map((chunk) => {
        if (typeof chunk === 'string') {
          return chunk
        } else {
          return decode(chunk, encoding)
        }
      }),
    )

/**
 * Encodes a stream of UTF-8 strings into a stream of Uint8Array binary chunks.
 *
 * @param stream The input stream of UTF-8 strings.
 *
 * @returns A stream of Uint8Array binary data.
 */
export const encodeUtf8ToBinaryStream = <E, R>(stream: Stream.Stream<string, E, R>) =>
  stream.pipe(Stream.map((s) => new TextEncoder().encode(s)))
