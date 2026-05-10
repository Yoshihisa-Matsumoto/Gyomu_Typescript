import { expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AutoField } from '../AutoField'
import '@testing-library/jest-dom'
import {} from '../types'
// import { FieldRendererMap } from '@core/engine/autoForm/types';

it('rendererとlayoutが正しく呼ばれる', () => {
  const mockRenderer = {
    text: vi.fn(() => <div data-testid="field" />),
  } as any

  const mockLayout = vi.fn(({ children }) => <div data-testid="layout">{children}</div>)

  render(
    <AutoField
      meta={{ name: 'name', label: '名前', widget: 'text', options: {} }}
      renderer={mockRenderer}
      layout={mockLayout}
    />,
  )

  expect(screen.getByTestId('layout')).toBeInTheDocument()
  expect(screen.getByTestId('field')).toBeInTheDocument()
})
