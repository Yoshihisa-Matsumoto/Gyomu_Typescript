// AutoForm.stories.tsx

// --- AutoForm ---

// --- UI ---
import { TextField } from '@mui/material'

// --- Types ---
import { defineEntityCrudSchemas, schemaField } from '@gyomu/core/entity'
import { MuiFieldLayout, MuiFormLayout, MuiSubmitButton } from '../../ui/adapters/mui'
import { muiRenderer } from '../../ui/renderer'
import { AutoForm } from './AutoForm'
import type { RendererMap } from '../../core/engine/autoForm/types'
import type { Meta, StoryObj } from '@storybook/react-vite'

// --------------------------------------------------
// Schema
// --------------------------------------------------

const userSchema = defineEntityCrudSchemas({
  fields: {
    age: schemaField.int({ min: 0, max: 99 }),
    name: schemaField.text({ maxLength: 10, minLength: 3 }),
    email: schemaField.text(),
  },
  options: {},
  tags: { entity: 'test' },
  ui: {
    age: { label: 'Age', widget: 'number' as const },
    name: { label: 'Name', widget: 'text' as const },
    email: {
      label: 'Email',
      widget: 'text' as const,
      format: 'email' as const,
    },
  },
})
// const userSchema = Schema.Struct({
//   name: schemaField.text({ maxLength: 10 }),

//   age: schemaField.int({ min: 0, max: 100 }),

//   email: schemaField.text(),
// });

// --------------------------------------------------
// Meta
// --------------------------------------------------

const metaStory: Meta<typeof AutoForm> = {
  title: 'Features/AutoForm',
  component: AutoForm,
}

export default metaStory

type Story = StoryObj<typeof AutoForm>

// --------------------------------------------------
// Stories
// --------------------------------------------------

export const Basic: Story = {
  render: () => (
    <AutoForm
      schema={userSchema.insertSchema}
      ui={userSchema.ui!}
      uiContext="create"
      onSubmit={(data) => {
        console.log('Submit:', data)
      }}
      fieldRenderer={muiRenderer}
      fieldLayout={MuiFieldLayout}
      layout={MuiFormLayout}
      components={{ SubmitButton: MuiSubmitButton }}
    />
  ),
}

export const Validation: Story = {
  render: () => (
    <AutoForm
      schema={userSchema.insertSchema}
      uiContext="create"
      ui={userSchema.ui!}
      initialValues={{
        id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
        name: '',
        age: 999,
        email: '',
      }}
      onSubmit={(data) => {
        console.log('Submit:', data)
      }}
    />
  ),
}

export const WithInitialValues: Story = {
  render: () => (
    <AutoForm
      schema={userSchema.updateSchema}
      ui={userSchema.ui!}
      uiContext="update"
      initialValues={{
        id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
        name: 'Taro',
        age: 20,
        email: 'taro@example.com',
      }}
      onSubmit={(data) => {
        console.log('Submit:', data)
      }}
    />
  ),
}

export const CustomRenderer: Story = {
  render: () => {
    const customRenderer = {
      text: ({ meta, value, onChange, onBlur }: any) => (
        <TextField
          fullWidth
          label={`Custom: ${meta.label}`}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          onBlur={() => onBlur?.(value)}
        />
      ),
      number: ({ meta, value, onChange, onBlur }: any) => (
        <TextField
          fullWidth
          type="number"
          label={`Custom: ${meta.label}`}
          value={value ?? ''}
          onChange={(e) => onChange?.(Number(e.target.value))}
          onBlur={() => onBlur?.(value)}
        />
      ),
      hidden: () => <input type="hidden" />,
    }

    return (
      <AutoForm
        schema={userSchema.insertSchema}
        uiContext="create"
        ui={userSchema.ui!}
        fieldRenderer={customRenderer as any as RendererMap}
        onSubmit={(data) => {
          console.log('Submit:', data)
        }}
      />
    )
  },
}
