import { Transform } from 'node:stream'
import { TextDecoder } from 'node:util'

/**
 * Decodes a Uint8Array into a string using the specified encoding.
 *
 * @param content The byte array to decode.
 *
 * @param encoding The character encoding to use. Defaults to 'utf-8'.
 *
 * @returns The decoded string.
 */
export const decode = (content: Uint8Array, encoding: string = 'utf-8'): string => {
  const decoder = new TextDecoder(encoding)
  return decoder.decode(content)
}

/**
 * Creates a Transform stream that decodes input chunks into strings using the specified encoding.
 *
 * @param encoding The character encoding to use for decoding.
 *
 * @returns A Transform stream for decoding character data.
 */
export function createDecoder(encoding: string) {
  const decoder = new TextDecoder(encoding, { fatal: false })

  return new Transform({
    transform(chunk, _encoding, callback) {
      try {
        // stream: true を渡すことで、分割されたチャンクを正しく保持しながらデコード
        const decoded = decoder.decode(chunk, { stream: true })
        this.push(decoded)
        callback()
      } catch (err) {
        callback(err as Error)
      }
    },
    flush(callback) {
      // 最後に残ったバッファを処理
      this.push(decoder.decode())
      callback()
    },
  })
}
