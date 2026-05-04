import { FieldRenderer } from '@ui/renderer/types';
import { useForm } from '@tanstack/react-form';
import { FormLayout } from '@ui/components/layout/headless/FormLayout';
import { MuiFormLayout } from '@ui/adapters/mui/layout/MuiFormLayout';
import { buildFormMetaFromStructSchema } from '@core/dsl';
import { CrudSchemaType, Fields, UIAnnotations } from '@gyomu/shared/entity';
import { Logger } from '@gyomu/core';
import React from 'react';
import { AutoField } from './AutoField';
import { FieldLayout } from '@ui/components/layout/headless/FieldLayout';
import { MuiFieldLayout } from '@ui/adapters/mui/layout/MuiFieldLayout';
import { muiRenderer } from '@ui/renderer/mui/muiRenderer';
import { DefaultSubmitButton } from '@ui/components/form/DefaultSubmitButton';
import { buildDefaultValues } from '@core/engine/autoForm';
import { validateWithSchema } from '@core/engine/autoForm';
import { SubmitButtonProps } from '@ui/components';

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
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => {
          const state = normalizeSubmitState(canSubmit, isSubmitting);
          return <SubmitButton {...state} />;
        }}
      </form.Subscribe>
    </form>
  );
}
function normalizeSubmitState(canSubmit?: boolean, isSubmitting?: boolean) {
  return {
    canSubmit: !!canSubmit,
    isSubmitting: !!isSubmitting,
  };
}
