import { Schema } from 'effect'
import { NonDocumentableTypeProperty } from './NonDocumentableTypeProperty.js'
import { DocumentableTypeProperty } from './DocumentableTypeProperty.js'

export const TypeProperty = Schema.Union([
  NonDocumentableTypeProperty,
  DocumentableTypeProperty,
]).annotate({
  description: 'Represents a type property.',
})

export type TypeProperty = typeof TypeProperty.Type
