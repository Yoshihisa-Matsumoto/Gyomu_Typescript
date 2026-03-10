import { Schema as S } from 'effect';

export type Infer<A extends S.Schema.Any> = S.Schema.Type<A>;
export type Encoded<A extends S.Schema.Any> = S.Schema.Encoded<A>;

export const define = <A, I>(schema: S.Schema<A, I, never>) => ({
  schema,
  decode: S.decodeUnknownSync(schema),
  encode: S.encodeSync(schema),
});
