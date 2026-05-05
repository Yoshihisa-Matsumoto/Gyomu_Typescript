// --- React / 外部ライブラリ ---
import React from 'react';
import { useForm } from '@tanstack/react-form';

// --- Core / Engine ---
import { buildFormMetaFromStructSchema } from '@core/dsl';
import { buildDefaultValues, validateWithSchema } from '@core/engine/autoForm';

// --- Shared / Core (ドメイン・基盤) ---
import { CrudSchemaType, Fields, UIAnnotations } from '@gyomu/shared/entity';
import { Logger } from '@gyomu/core';

// --- UI (抽象コンポーネント) ---
import { FormLayout, FieldLayout } from '@ui/components/layout';
import { DefaultSubmitButton } from '@ui/components/form';
import { SubmitButtonProps } from '@ui/components';
import { FieldRenderer } from '@ui/renderer';

// --- UI (MUI Adapter) ---
import { MuiFormLayout, MuiFieldLayout } from '@ui/adapters/mui';
import { muiRenderer } from '@ui/renderer/mui';

// --- ローカル ---
import { AutoField } from './AutoField';

type AutoFormProps<TFields extends Fields> = {
  schema: CrudSchemaType<TFields, boolean>;
  uiContext: 'view' | 'create' | 'update';
  logger?: Logger;
  ui?: UIAnnotations<TFields>;
  initialValues?: Record<string, any>;
  onSubmit: (data: any) => void | Promise<void>;

  fieldRegistry?: Record<string, FieldRenderer>;
  fieldLayout?: FieldLayout;
  layout?: FormLayout;

  components?: {
    SubmitButton?: React.ComponentType<SubmitButtonProps>;
  };
};

export function AutoForm<TFields extends Fields>({
  schema,
  uiContext,
  logger,
  initialValues,
  ui,
  onSubmit,
  fieldRegistry = muiRenderer,
  fieldLayout = MuiFieldLayout,
  layout: Layout = MuiFormLayout,
  components,
}: AutoFormProps<TFields>) {
  const SubmitButton = components?.SubmitButton ?? DefaultSubmitButton;

  const fieldConfigs = React.useMemo(
    () =>
      buildFormMetaFromStructSchema({
        schema,
        uiContext,
        ...(logger && { logger }),
        ...(ui && { ui: ui }),
      }),
    [schema, uiContext, logger, ui],
  );
  console.log('Field Meta', JSON.stringify(fieldConfigs, null, 2));
  const form = useForm({
    defaultValues: buildDefaultValues(fieldConfigs, initialValues),
    onSubmit: async ({ value }) => {
      const result = validateWithSchema(schema, value);
      if (!result.ok) return;

      await onSubmit(result.data);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Layout>
        {fieldConfigs.map((field) => (
          <form.Field key={field.name} name={field.name}>
            {(fieldApi) => (
              <AutoField
                meta={field}
                fieldApi={fieldApi}
                renderer={fieldRegistry}
                layout={fieldLayout}
              />
            )}
          </form.Field>
        ))}
      </Layout>

      <form.Subscribe
        selector={(state) => ({
          canSubmit: state.canSubmit,
          isSubmitting: state.isSubmitting,
        })}
      >
        {(rawState) => {
          const state = normalizeFormState(rawState);
          return <SubmitButton {...state} />;
        }}
      </form.Subscribe>
    </form>
  );
}

type NormalizedFormState = {
  canSubmit: boolean;
  isSubmitting: boolean;
};
function normalizeFormState(state: {
  canSubmit?: boolean;
  isSubmitting?: boolean;
}): NormalizedFormState {
  return {
    canSubmit: !!state.canSubmit,
    isSubmitting: !!state.isSubmitting,
  };
}
