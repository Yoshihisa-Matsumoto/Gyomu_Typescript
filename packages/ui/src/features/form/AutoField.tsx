import { withOptional } from '@gyomu/schema'
import { muiRenderer } from '../../ui/renderer/mui/muiRenderer'
import { MuiFieldLayout } from '../../ui/adapters/mui/layout/MuiFieldLayout'
import type { AutoFieldProps } from './types'

export function AutoField({
  meta,
  renderer = muiRenderer,
  layout: Layout = MuiFieldLayout,
  value,
  onBlur,
  onChange,
  error,
}: AutoFieldProps) {
  // const controller = createFieldController(field);
  // console.log(
  //   `Field: ${meta.name} Value: ${value} meta: ${JSON.stringify(meta)}`,
  // );
  const Component = renderer[meta.widget] as any

  if (!Component) throw new Error(`No renderer for widget: ${meta.widget}`)
  return (
    <Layout meta={meta} label={meta.label ?? meta.name} {...withOptional({ error: error })}>
      <Component
        meta={meta}
        {...withOptional({
          value: value,
          onChange: onChange,
          onBlur: onBlur,
          error: error?.[0],
        })}
      />
    </Layout>
  )
}
