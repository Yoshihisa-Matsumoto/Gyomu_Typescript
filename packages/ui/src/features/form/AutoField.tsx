import { FormFieldMeta } from '@core/dsl';
import { FieldRenderer } from '@ui/renderer';
import { resolveFieldType } from '@core/engine/autoForm';
import { muiRenderer } from '@ui/renderer/mui';
import { MuiFieldLayout } from '@ui/adapters/mui';
import { FieldLayout } from '@ui/components/layout';

export function AutoField({
  fieldApi,
  meta,
  renderer = muiRenderer,
  layout: Layout = MuiFieldLayout,
}: {
  fieldApi: any;
  meta: FormFieldMeta;
  renderer?: Record<string, FieldRenderer>;
  layout: FieldLayout;
}) {
  const value = fieldApi.state.value;

  const key = resolveFieldType(meta);
  const Component = renderer[key];

  if (!Component) throw new Error(`No renderer for widget: ${meta.widget}`);
  return (
    <Layout
      label={meta.label ?? meta.name}
      error={fieldApi.state.meta.touchedErrors}
    >
      <Component
        meta={meta}
        value={value}
        onChange={fieldApi.handleChange}
        onBlur={fieldApi.handleBlur}
      />
    </Layout>
  );
}
