import React from 'react'
import { ShadcnFieldLayout } from '..'
import { shadcnRenderer } from '../../../renderer/shadcn'
import { AutoField } from '../../../../features/form/AutoField'
import type { Meta, StoryObj } from '@storybook/react-vite'

import '../../../../theme/styles/globals.css'

const meta: Meta<typeof AutoField> = {
  title: 'Shadcn/UI AutoForm/AutoField',
  component: AutoField,
}

export default meta

type Story = StoryObj<typeof AutoField>

/**
 * Displays a story for the Text field variant.
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
    renderer: shadcnRenderer,
    layout: ShadcnFieldLayout,
  },
}

/**
 * Displays a story for the Number field variant.
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
    renderer: shadcnRenderer,
    layout: ShadcnFieldLayout,
  },
}

/**
 * Displays a story for the Email field variant.
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
    renderer: shadcnRenderer,
    layout: ShadcnFieldLayout,
  },
}

/**
 * Displays a story for the Textarea field variant.
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
    renderer: shadcnRenderer,
    layout: ShadcnFieldLayout,
  },
}

/**
 * Displays a story for the Select field variant with enumerated options.
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
    renderer: shadcnRenderer,
    layout: ShadcnFieldLayout,
  },
}

/**
 * Displays a story for the field in an error state.
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
    renderer: shadcnRenderer,
    layout: ShadcnFieldLayout,
  },
}

/**
 * Displays an interactive story demonstrating state updates.
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
        layout={ShadcnFieldLayout}
        renderer={shadcnRenderer}
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
 * Displays a collection of all available field types.
 */
export const AllFields: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16 }}>
      <AutoField
        meta={{ name: 'text', label: 'Text', widget: 'text', options: {} }}
        value="text"
        layout={ShadcnFieldLayout}
        renderer={shadcnRenderer}
      />
      <AutoField
        meta={{
          name: 'number',
          label: 'Number',
          widget: 'number',
          options: {},
        }}
        value={123}
        layout={ShadcnFieldLayout}
        renderer={shadcnRenderer}
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
        layout={ShadcnFieldLayout}
        renderer={shadcnRenderer}
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
        layout={ShadcnFieldLayout}
        renderer={shadcnRenderer}
      />
      <AutoField
        meta={{
          name: 'textarea',
          label: 'Textarea',
          widget: 'textarea',
          options: {},
        }}
        value="long text"
        layout={ShadcnFieldLayout}
        renderer={shadcnRenderer}
      />
      <AutoField
        meta={{ name: 'date', label: 'Date', widget: 'date', options: {} }}
        value="2026-01-01"
        layout={ShadcnFieldLayout}
        renderer={shadcnRenderer}
      />
    </div>
  ),
}
