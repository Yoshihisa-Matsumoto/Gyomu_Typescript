import { Schema } from 'effect'

/**
 * Defines the source type of a property, indicating whether it originates from a property declaration, constructor parameter, or parameter declaration.
 */
export const PropertySource = Schema.Literals([
  'property-declaration',
  'constructor-parameter',
  'parameter-declaration',
])

/**
 * The union type representing the valid sources for a property.
 */
export type PropertySource = Schema.Schema.Type<typeof PropertySource>
