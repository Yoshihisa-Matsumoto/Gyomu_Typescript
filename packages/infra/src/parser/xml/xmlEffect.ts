import { ValueError } from '@gyomu/schema'
import { fromPromise } from '@gyomu/schema/effect'
import type { Effect } from 'effect'

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
