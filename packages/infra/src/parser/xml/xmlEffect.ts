import { ValueError } from '@gyomu/schema'
import { fromPromise } from '@gyomu/schema/effect'
import type { Effect } from 'effect'

/**
 * Parses an XML string into a structured object.
 *
 * @param text The XML content string to be parsed.
 *
 * @param context Optional context identifier associated with the XML parsing.
 *
 * @returns An Effect that resolves to the parsed response object or fails with a ValueError.
 */
export const xmlEffect = <ResponseType>(
  text: string,
  context?: string,
): Effect.Effect<ResponseType, ValueError> =>
  fromPromise(ValueError, () => ({
    message: `fail to parse XML`,
    value: { context, text },
  }))(async () => {
    const xml2js = await import('xml2js')
    const parser = new xml2js.Parser()
    return parser.parseStringPromise(text) as Promise<ResponseType>
  })
