import { Schema } from 'effect'

export const TypeSource = Schema.Literals(['typescript', 'effect-schema'])

export type TypeSource = Schema.Schema.Type<typeof TypeSource>
