import { Schema } from 'effect'
import { NonDocumentableTypeProperty } from './NonDocumentableTypeProperty.js'
import { DocumentableTypeProperty } from './DocumentableTypeProperty.js'

/**
 * Represents a type property, which can either be documentable or non-documentable.
 */
export const TypeProperty = Schema.Union([
  NonDocumentableTypeProperty,
  DocumentableTypeProperty,
]).annotate({
  description: 'Represents a type property.',
})

/**
 * Represents a type property, which can either be documentable or non-documentable.
 */
export type TypeProperty = typeof TypeProperty.Type
