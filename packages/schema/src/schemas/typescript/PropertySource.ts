import { Schema } from 'effect'

export const PropertySource = Schema.Literals([
  'property-declaration',
  'constructor-parameter',
  'parameter-declaration',
])

export type PropertySource = Schema.Schema.Type<typeof PropertySource>
