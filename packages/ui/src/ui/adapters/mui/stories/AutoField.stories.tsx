import React from 'react'
import { MuiFieldLayout } from '..'
import { muiRenderer } from '../../../renderer/mui'
import { AutoField } from '../../../../features/form/AutoField'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof AutoField> = {
  title: 'MUI AutoForm/AutoField',
  component: AutoField,
}

export default meta

type Story = StoryObj<typeof AutoField>

/**
 * Story demonstrating a text input field.
 */
export const Text: Story = {
  args: {
    meta: {
      name: 'text',
      label: 'Text',
      widget: 'text',
      options: {},
    },
    value: 'hello',
    renderer: muiRenderer,
    layout: MuiFieldLayout,
  },
}

/**
 * Story demonstrating a number input field.
 */
export const Number: Story = {
  args: {
    meta: {
      name: 'age',
      label: 'Age',
      widget: 'number',
      options: {},
    },
    value: 20,
  },
}

/**
 * Story demonstrating an email input field.
 */
export const Email: Story = {
  args: {
    meta: {
      name: 'email',
      label: 'Email',
      widget: 'text',
      format: 'email',
      options: {},
    },
    value: 'test@example.com',
  },
}

/**
 * Story demonstrating a textarea input field.
 */
export const Textarea: Story = {
  args: {
    meta: {
      name: 'desc',
      label: 'Description',
      widget: 'textarea',
      options: {},
    },
    value: 'long text...',
  },
}

/**
 * Story demonstrating a select dropdown input field.
 */
export const Select: Story = {
  args: {
    meta: {
      name: 'jobType',
      label: 'Job Type',
      widget: 'select',
      options: {},
      enumAttribute: {
        option1: { label: 'Option 1' },
        option2: { label: 'Option 2' },
      },
    },
    value: 'option1',
  },
}

/**
 * Story demonstrating an input field with an error state.
 */
export const WithError: Story = {
  args: {
    meta: {
      name: 'text',
      label: 'Text',
      widget: 'text',
      options: {},
    },
    value: '',
    error: '必須です',
  },
}

/**
 * Story demonstrating an interactive input field with state management.
 */
export const Interactive: Story = {
  render: (args) => {
    const [value, setValue] = React.useState(args.value)

    return (
      <AutoField
        {...args}
        value={value}
        onChange={(v: any) => {
          setValue(v)
          args.onChange?.(v)
        }}
      />
    )
  },
  args: {
    meta: {
      name: 'text',
      label: 'Text',
      widget: 'text',
      options: {},
    },
    value: 'edit me',
  },
}

/**
 * Story displaying a collection of various input field types in a single view.
 */
export const AllFields: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <AutoField
        meta={{ name: 'text', label: 'Text', widget: 'text', options: {} }}
        value="text"
        layout={MuiFieldLayout}
      />
      <AutoField
        meta={{
          name: 'number',
          label: 'Number',
          widget: 'number',
          options: {},
        }}
        value={123}
        layout={MuiFieldLayout}
      />
      <AutoField
        meta={{
          name: 'email',
          label: 'Email',
          widget: 'text',
          format: 'email',
          options: {},
        }}
        value="test@test.com"
        layout={MuiFieldLayout}
      />
      <AutoField
        meta={{
          name: 'password',
          label: 'Password',
          widget: 'text',
          format: 'password',
          options: {},
        }}
        value="secret"
        layout={MuiFieldLayout}
      />
      <AutoField
        meta={{
          name: 'textarea',
          label: 'Textarea',
          widget: 'textarea',
          options: {},
        }}
        value="long text"
        layout={MuiFieldLayout}
      />
      <AutoField
        meta={{ name: 'date', label: 'Date', widget: 'date', options: {} }}
        value="2026-01-01"
        layout={MuiFieldLayout}
      />
    </div>
  ),
}
