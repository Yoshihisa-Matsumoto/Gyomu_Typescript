import type { Schema } from 'effect'
import type { defineEntityCrudSchemas } from './defineEntityCrudSchemas.js'

export type Fields = Record<string, Schema.Schema<any>>
export type EntityDefinition<
  TFields extends Fields,
  TIncludeAudit extends boolean,
  TUI = UIAnnotations<TFields>,
> = {
  fields: TFields
  tags: {
    entity: string
    sensitiveFields?: ReadonlyArray<Extract<keyof TFields, string>>
  }
  options?: {
    includeAudit?: TIncludeAudit
    keyMapping?: { readonly [K in keyof TFields]?: PropertyKey }
  }
  ui?: TUI
}

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

export type Optionalized<T extends Fields> = {
  [K in keyof T]: ReturnType<typeof Schema.optional<T[K]>>
}

export type CrudSchemaGeneratorType<
  TFields extends Fields,
  TIncludeAudit extends boolean,
> = ReturnType<typeof defineEntityCrudSchemas<TFields, TIncludeAudit>>

type InsertSchemaOf<T> = T extends { insertSchema: infer S } ? S : never
type UpdateSchemaOf<T> = T extends { updateSchema: infer S } ? S : never
type SelectSchemaOf<T> = T extends { selectSchema: infer S } ? S : never

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
export type UIAnnotationMap = {
  text: {
    format?: 'email' | 'password' | 'phone'
  }
  number: object
  textarea: object
  date: object
  hidden: {
    readonly?: never
    visible?: never
    order?: never
  }
  select: {
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
export type UIAnnotation = {
  [K in keyof UIAnnotationMap]: { widget: K } & Omit<BaseUIAnnotation, keyof UIAnnotationMap[K]> & // ←衝突回避
    UIAnnotationMap[K]
}[keyof UIAnnotationMap]

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never

type DistributivePartial<T> = T extends any ? Partial<T> : never
export type UIAnnotationOverride = DistributiveOmit<DistributivePartial<UIAnnotation>, 'widget'>
export type UIAnnotationField =
  | UIAnnotation
  | {
      default: UIAnnotation
      view?: UIAnnotationOverride
      update?: UIAnnotationOverride
      create?: UIAnnotationOverride
    }
export type UIAnnotations<TFields> = Partial<{
  [K in keyof TFields]?: UIAnnotationField
}>

export type UIAnnotationByWidget<K extends keyof UIAnnotationMap> = Extract<
  UIAnnotation,
  { widget: K }
>
