import { Effect, Stream } from 'effect'
import xml2js from 'xml2js'
import { fromPromise } from '@gyomu/schema/effect'
import { ValueError } from '@gyomu/schema'
import type { NetworkError } from '@gyomu/schema'

export const textEffect = (stream: Stream.Stream<Uint8Array, NetworkError>) =>
  stream.pipe(
    Stream.decodeText(),
    Stream.runCollect,
    Effect.map((chunks) => chunks.join('')),
  )

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
