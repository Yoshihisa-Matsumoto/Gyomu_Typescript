import React from 'react'
import { MuiFieldLayout } from '../../ui/adapters/mui'
import { muiRenderer } from '../../ui/renderer'
import { AutoField } from './AutoField'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof AutoField> = {
  title: 'AutoForm/AutoField',
  component: AutoField,
}

export default meta

type Story = StoryObj<typeof AutoField>

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
