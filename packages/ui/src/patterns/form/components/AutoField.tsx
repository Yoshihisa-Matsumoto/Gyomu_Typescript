import { FormFieldMeta } from '../../../core/dsl/type.js';
import { FieldRenderer } from '../../../renderer/headless/fieldRenderer.js';
import { muiRenderer } from '../../../renderer/mui/muiRenderer.js';
import { MuiFieldLayout } from '../../../components/mui/layout/MuiFieldLayout.js';
import { FieldLayout } from '../../../components/layout/headless/FieldLayout.js';

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

  const Component = renderer[meta.widget ?? 'text'] ?? renderer?.['text'];

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
