import { Effect } from 'effect';
import { fromPromise } from '@gyomu/shared/effect';
import { ValueError } from '@gyomu/shared';

export const xmlEffect = <ResponseType>(
  text: string,
  context?: string,
): Effect.Effect<ResponseType, ValueError> =>
  fromPromise(
    ValueError,
    `fail to parse XML${context ? `: ${context}` : ''}`,
  )(async () => {
    const xml2js = await import('xml2js');
    const parser = new xml2js.Parser();
    return parser.parseStringPromise(text) as Promise<ResponseType>;
  });
