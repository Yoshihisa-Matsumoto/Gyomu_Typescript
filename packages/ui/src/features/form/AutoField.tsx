import { resolveFieldType } from '@core/engine/autoForm';
import { muiRenderer } from '@ui/renderer/mui';
import { MuiFieldLayout } from '@ui/adapters/mui';
import { AutoFieldProps } from './types';
import { createFieldController } from './adapter';
import { withOptional } from '@gyomu/shared';

export function AutoField<TValue>({
  fieldApi,
  meta,
  renderer = muiRenderer,
  layout: Layout = MuiFieldLayout,
}: AutoFieldProps<TValue>) {
  const controller = createFieldController(fieldApi);
  console.log(`Field: ${meta.name} Value: ${controller.value}`);
  const key = resolveFieldType(meta);
  const Component = renderer[key];

  if (!Component) throw new Error(`No renderer for widget: ${meta.widget}`);
  return (
    <Layout
      label={meta.label ?? meta.name}
      {...withOptional({ error: controller.error })}
    >
      <Component meta={meta} {...controller} />
    </Layout>
  );
}
