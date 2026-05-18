// --- Shared / Core (ドメイン・基盤) ---
import type { CrudSchemaType, Fields, UIAnnotations } from '@gyomu/schema/entity'
import type { Logger } from '@gyomu/schema'

// --- UI (抽象コンポーネント) ---
import type { FieldLayout, FormLayout, SubmitButtonProps } from '../../ui/components'

// --- ローカル ---
import type { FormFieldMeta } from '@gyomu/ui-core/dsl'
import type { RendererMap } from '@gyomu/ui-core/engine'

export type AutoFieldProps = {
  meta: FormFieldMeta
  renderer?: RendererMap
  layout: FieldLayout
  value?: unknown
  onBlur?: (v: any) => void
  onChange?: (v: any) => void
  error?: string
}

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
}
