import { Effect, Stream } from 'effect'
import xml2js from 'xml2js'
import { fromPromise } from '@gyomu/schema/effect'
import { ValueError } from '@gyomu/schema'
import type { NetworkError } from '@gyomu/schema'

/**
 * Decodes a stream of Uint8Array chunks into a single concatenated text string.
 *
 * @param stream The stream of binary data to be decoded.
 *
 * @returns An effect that produces the decoded string result or fails with a NetworkError.
 */
export const textEffect = (stream: Stream.Stream<Uint8Array, NetworkError>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runCollect,
    Effect.map((chunks) => chunks.join('')),
  )

/**
 * Parses an XML string into a structured response object using xml2js.
 *
 * @param text The XML-formatted string to parse.
 *
 * @returns An effect yielding the parsed object or a ValueError if parsing fails.
 */
export const parseXmlEffect = <ResponseType>(text: string) => {
  // =====================
  // XML parse
  // =====================
  const parser = new xml2js.Parser()

  return fromPromise(ValueError, () => ({
    message: 'Fail to parse into xml',
    value: text,
  }))(() => parser.parseStringPromise(text) as Promise<ResponseType>)
}
