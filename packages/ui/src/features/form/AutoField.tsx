import { resolveFieldType } from '@core/engine/autoForm';
import { muiRenderer } from '@ui/renderer/mui';
import { MuiFieldLayout } from '@ui/adapters/mui';
import { withOptional } from '@gyomu/shared';
import { AutoFieldProps } from './types';

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
  console.log(`Field: ${meta.name} Value: ${value}`);
  const key = resolveFieldType(meta);
  const Component = renderer[key] as any;

  if (!Component) throw new Error(`No renderer for widget: ${meta.widget}`);
  return (
    <Layout label={meta.label ?? meta.name} {...withOptional({ error: error })}>
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
  );
}
