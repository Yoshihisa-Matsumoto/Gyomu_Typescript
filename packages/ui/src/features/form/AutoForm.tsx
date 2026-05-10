// --- React / 外部ライブラリ ---
import React, { useEffect } from 'react'
import { useForm } from '@tanstack/react-form'

// --- Core / Engine ---

import { buildFieldSchemaMap } from '@gyomu/core/entity'
import { buildFormMetaFromStructSchema } from '../../core/dsl'
import { buildDefaultValues, validateField, validateWithSchema } from '../../core/engine'

// --- Shared / Core (ドメイン・基盤) ---
// --- UI (MUI Adapter) ---
import { MuiFieldLayout, MuiFormLayout } from '../../ui/adapters/mui'
import { muiRenderer } from '../../ui/renderer'

// --- ローカル ---
import { DefaultSubmitButton } from '../../ui/components/form/DefaultSubmitButton'
import { AutoField } from './AutoField'
import type { Schema } from 'effect'
import type { Fields } from '@gyomu/core/entity'
import type { AutoFormProps } from './types'

export function AutoForm<TFields extends Fields>({
  schema,
  uiContext,
  logger,
  initialValues,
  ui,
  onSubmit,
  fieldRenderer = muiRenderer,
  fieldLayout = MuiFieldLayout,
  layout: Layout = MuiFormLayout,
  components,
}: AutoFormProps<TFields>) {
  const SubmitButton = components?.SubmitButton ?? DefaultSubmitButton

  const fieldSchemaMap: Partial<Record<keyof TFields, Schema.Schema<any>>> =
    buildFieldSchemaMap(schema)
  const fieldConfigs = React.useMemo(
    () =>
      buildFormMetaFromStructSchema({
        schema,
        uiContext,
        ...(logger && { logger }),
        ...(ui && { ui: ui }),
      }),
    [schema, uiContext, logger, ui],
  )
  console.log('Field Meta', JSON.stringify(fieldConfigs, null, 2))
  const form = useForm({
    defaultValues: buildDefaultValues(fieldConfigs, initialValues),
    onSubmit: async ({ value }) => {
      const result = validateWithSchema(schema, value)
      if (!result.ok) return

      await onSubmit(result.data)
    },
  })

  useEffect(() => {
    form.validateAllFields('change')
  }, [])

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <Layout>
        {fieldConfigs.map((field) => (
          <form.Field
            key={field.name}
            name={field.name}
            validators={{
              onChange: ({ value }) => {
                const fieldSchema = fieldSchemaMap[field.name]
                if (!fieldSchema) {
                  console.warn(`No schema found for field: ${field.name}`)
                  return undefined
                }
                const result = validateField(fieldSchema, value)
                if (!result.ok) {
                  return result.errors
                }
                return undefined
              },
            }}
          >
            {(fieldApi) => {
              const error = fieldApi.state.meta.errors
                .map((e) => e?.message)
                .filter((m): m is string => !!m)
                .join(', ')
              return (
                <AutoField
                  meta={field}
                  renderer={fieldRenderer}
                  layout={fieldLayout}
                  value={fieldApi.state.value}
                  onChange={fieldApi.handleChange}
                  onBlur={fieldApi.handleBlur}
                  error={error}
                />
              )
            }}
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
          console.log('Raw Form State:', rawState)
          const state = normalizeFormState(rawState)
          console.log('Form State:', state)
          return (
            <SubmitButton
              disabled={!state.canSubmit || state.isSubmitting}
              isSubmitting={state.isSubmitting}
            />
          )
        }}
      </form.Subscribe>
    </form>
  )
}

type NormalizedFormState = {
  canSubmit: boolean
  isSubmitting: boolean
}
function normalizeFormState(state: {
  canSubmit?: boolean
  isSubmitting?: boolean
}): NormalizedFormState {
  return {
    canSubmit: !!state.canSubmit,
    isSubmitting: !!state.isSubmitting,
  }
}
