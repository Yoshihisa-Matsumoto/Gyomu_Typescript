import type { Mutable } from 'effect/Types'
import type { Schema } from 'effect'
import type { defineEntityCrudSchemas } from './defineEntityCrudSchemas.js'

/**
 * Maps field names to their respective schema definitions.
 */
export type Fields = Record<string, Schema.Schema<any>>

/**
 * Defines the structure of an entity, including its fields, metadata tags, options, and UI annotations.
 */
export type EntityDefinition<
  TFields extends Fields,
  TIncludeAudit extends boolean,
  TUI = UIAnnotations<TFields>,
> = {
  /**
   * The schema definitions for the entity fields.
   */
  fields: TFields

  /**
   * Metadata tags describing the entity.
   */
  tags: {
    /**
     * A unique identifier for the entity.
     */
    entity: string

    /**
     * An optional list of field names that contain sensitive data, intended for masking or filtering.
     */
    sensitiveFields?: ReadonlyArray<Extract<keyof TFields, string>>
  }

  /**
   * Optional configuration settings for the entity.
   */
  options?: {
    /**
     * Indicates whether audit fields should be included in the entity schema.
     */
    includeAudit?: TIncludeAudit

    /**
     * An optional map for translating internal field keys to external property keys.
     */
    keyMapping?: { readonly [K in keyof TFields]?: PropertyKey }
  }

  /**
   * UI annotations for customizing the rendering of entity fields.
   */
  ui?: TUI
}

/**
 * Removes the readonly modifier from all properties of a type.
 */
export type DeepMutable<T> =
  T extends ReadonlyArray<infer U>
    ? Array<Mutable<U>>
    : T extends object
      ? { -readonly [K in keyof T]: Mutable<T[K]> }
      : T

/**
 * Creates a mutable copy of a type by removing readonly modifiers recursively.
 */
export type Builder<T> = DeepMutable<T>

/**
 * Wraps all fields in a schema definition with an optional modifier.
 */
export type Optionalized<T extends Fields> = {
  [K in keyof T]: ReturnType<typeof Schema.optional<T[K]>>
}

/**
 * Represents the generated CRUD schemas for a given entity definition.
 */
export type CrudSchemaGeneratorType<
  TFields extends Fields,
  TIncludeAudit extends boolean,
> = ReturnType<typeof defineEntityCrudSchemas<TFields, TIncludeAudit>>

type InsertSchemaOf<T> = T extends { insertSchema: infer S } ? S : never
type UpdateSchemaOf<T> = T extends { updateSchema: infer S } ? S : never
type SelectSchemaOf<T> = T extends { selectSchema: infer S } ? S : never

/**
 * A union type representing the available insert, update, and select CRUD schemas for an entity.
 */
export type CrudSchemaType<TFields extends Fields, TIncludeAudit extends boolean> =
  | InsertSchemaOf<CrudSchemaGeneratorType<TFields, TIncludeAudit>>
  | UpdateSchemaOf<CrudSchemaGeneratorType<TFields, TIncludeAudit>>
  | SelectSchemaOf<CrudSchemaGeneratorType<TFields, TIncludeAudit>>

type BaseUIAnnotation = {
  label?: string
  placeholder?: string
  readonly?: boolean
  visible?: boolean
  order?: number
}

/**
 * Defines the mapping between widget types and their respective annotation configurations.
 */
export type UIAnnotationMap = {
  /**
   * Configuration for text-based input widgets.
   */
  text: {
    /**
     * Defines specific formatting requirements for the text field.
     */
    format?: 'email' | 'password' | 'phone'
  }

  /**
   * Configuration for numeric input widgets.
   */
  number: object

  /**
   * Configuration for multiline text input widgets.
   */
  textarea: object

  /**
   * Configuration for date-type UI input widgets.
   */
  date: object

  /**
   * Configuration for fields hidden from the user interface.
   */
  hidden: {
    /**
     * Disables the readonly state for hidden fields.
     */
    readonly?: never

    /**
     * Disables the visible state for hidden fields.
     */
    visible?: never

    /**
     * Disables custom ordering for hidden fields.
     */
    order?: never
  }

  /**
   * Configuration for select or dropdown input widgets.
   */
  select: {
    /**
     * Attributes for mapping enum values to display labels, ordering, and state.
     */
    enumAttribute: Record<
      string,
      {
        label?: string | ((value: string) => string)
        order?: number
        disabled?: boolean
      }
    >
  }
}

/**
 * Represents a single UI widget annotation derived from the UIAnnotationMap.
 */
export type UIAnnotation = {
  [K in keyof UIAnnotationMap]: { widget: K } & Omit<BaseUIAnnotation, keyof UIAnnotationMap[K]> & // ←衝突回避
    UIAnnotationMap[K]
}[keyof UIAnnotationMap]

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

type DistributivePartial<T> = T extends any ? Partial<T> : never

/**
 * A partial, distributive version of UIAnnotation without the widget identifier.
 */
export type UIAnnotationOverride = DistributiveOmit<DistributivePartial<UIAnnotation>, 'widget'>

/**
 * Defines a UI annotation for a field, either as a simple annotation or an object specifying mode-specific overrides.
 */
export type UIAnnotationField =
  | UIAnnotation
  | {
      default: UIAnnotation
      view?: UIAnnotationOverride
      update?: UIAnnotationOverride
      create?: UIAnnotationOverride
    }

/**
 * A partial map of field names to their corresponding UI annotations.
 */
export type UIAnnotations<TFields> = Partial<{
  [K in keyof TFields]?: UIAnnotationField
}>

/**
 * Extracts the UI annotation type for a specific widget.
 */
export type UIAnnotationByWidget<K extends keyof UIAnnotationMap> = Extract<
  UIAnnotation,
  { widget: K }
>
