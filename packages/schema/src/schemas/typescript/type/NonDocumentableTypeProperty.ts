import { Schema } from 'effect'
import { TypePropertyBase } from './TypePropertyBase.js'

/**
 * Represents a non-documentable type property.
 */
export const NonDocumentableTypeProperty = Schema.Struct({
  /**
   * Indicates that this member is documentable.
   */
  documentable: Schema.Literal(false).annotate({
    description: 'Indicates that this member is documentable.',
  }),
})
  .pipe(Schema.fieldsAssign(TypePropertyBase.fields))
  .annotate({
    description: 'Represents a non-documentable type property.',
  })

/**
 * Represents a non-documentable type property.
 */
export type NonDocumentableTypeProperty = typeof NonDocumentableTypeProperty.Type
