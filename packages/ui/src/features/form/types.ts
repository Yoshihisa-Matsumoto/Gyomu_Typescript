// --- Shared / Core (ドメイン・基盤) ---
import type { CrudSchemaType, Fields, UIAnnotations } from '@gyomu/schema/entity'
import type { Logger } from '@gyomu/schema'

// --- UI (抽象コンポーネント) ---
import type { FieldLayout, FormLayout, SubmitButtonProps } from '../../ui/components'

// --- ローカル ---
import type { FormFieldMeta } from '@gyomu/ui-core/dsl'
import type { RendererMap } from '@gyomu/ui-core/engine'

/**
 * Defines the properties required to render an automatic form field.
 *
 * @param meta Metadata for the form field.
 *
 * @param renderer Optional mapping of component renderers.
 *
 * @param layout Configuration for the field's layout.
 *
 * @param value The current value of the field.
 *
 * @param onBlur Callback triggered when the field loses focus.
 *
 * @param onChange Callback triggered when the field value changes.
 *
 * @param error Optional error message for the field.
 */
export type AutoFieldProps = {
  meta: FormFieldMeta
  renderer?: RendererMap
  layout: FieldLayout
  value?: unknown
  onBlur?: (v: any) => void
  onChange?: (v: any) => void
  error?: string
}

/**
 * Defines the configuration properties for an automatic form, including schema, UI context, and render overrides.
 *
 * @template TFields extends Fields
 */
export type AutoFormProps<TFields extends Fields> = {
  schema: CrudSchemaType<TFields, boolean>
  uiContext: 'view' | 'create' | 'update'
  logger?: Logger
  ui: UIAnnotations<TFields>
  initialValues?: Record<string, any>
  onSubmit: (data: any) => void | Promise<void>

  fieldRenderer?: RendererMap
  fieldLayout?: FieldLayout
  layout?: FormLayout

  components?: {
    SubmitButton?: React.ComponentType<SubmitButtonProps>
  }
  showActions?: boolean
}
