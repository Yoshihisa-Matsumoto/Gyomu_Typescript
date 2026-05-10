import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { defineEntityCrudSchemas, schemaField } from '@gyomu/core/entity'
import { withOptional } from '@gyomu/core'
import { AutoForm } from '../AutoForm'

describe('AutoForm Test', () => {
  const schema = defineEntityCrudSchemas({
    fields: {
      age: schemaField.int({ min: 0, max: 99 }),
      name: schemaField.text({ maxLength: 10, minLength: 3 }),
    },
    options: {},
    tags: { entity: 'test' },
    ui: {
      age: { label: 'Age', widget: 'number' as const },
      name: { label: 'Name', widget: 'text' as const },
    },
  })
  it('calls onSubmit when form is valid', async () => {
    const handleSubmit = vi.fn()

    render(
      <AutoForm
        schema={schema.selectSchema}
        ui={schema.ui!}
        uiContext="view"
        initialValues={{
          name: 'Taro',
          age: 20,
          id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
        }}
        onSubmit={handleSubmit}
        {...withOptional({ ui: schema.ui })}
      />,
    )

    // 入力（必要なら）
    // fireEvent.change(...)
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  it('does not call onSubmit when validation fails', async () => {
    const handleSubmit = vi.fn()

    render(
      <AutoForm
        schema={schema.insertSchema}
        ui={schema.ui!}
        uiContext="create"
        onSubmit={handleSubmit}
      />,
    )

    // invalidな入力
    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled()
    })
  })

  it('renders fields from schema', () => {
    render(
      <AutoForm
        schema={schema.insertSchema}
        ui={schema.ui!}
        uiContext="create"
        initialValues={{
          name: 'Taro',
          age: 20,
          id: 'f6ae5f2d-bd14-4c5f-9cc3-3a69ef90dd5b',
        }}
        onSubmit={() => {}}
      />,
    )

    expect(screen.getByDisplayValue('Taro')).toBeInTheDocument()
  })
})
