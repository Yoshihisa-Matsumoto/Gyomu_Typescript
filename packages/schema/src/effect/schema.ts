import type { Schema } from 'effect'

export type Decode<S extends Schema.Top> = S['DecodingServices']
