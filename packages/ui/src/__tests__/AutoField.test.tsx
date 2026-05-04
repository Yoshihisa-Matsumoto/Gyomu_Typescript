import { expect, it, vi } from 'vitest';
import { AutoField } from '../features/form/AutoField';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

it('rendererとlayoutが正しく呼ばれる', () => {
  const mockRenderer = {
    text: vi.fn(() => <div data-testid="field" />),
  };

  const mockLayout = vi.fn(({ children }) => (
    <div data-testid="layout">{children}</div>
  ));

  const fieldApi = {
    state: {
      value: 'abc',
      meta: { touchedErrors: [] },
    },
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
  };

  render(
    <AutoField
      fieldApi={fieldApi}
      meta={{ name: 'name', label: '名前', widget: 'text', options: {} }}
      renderer={mockRenderer}
      layout={mockLayout}
    />,
  );

  expect(screen.getByTestId('layout')).toBeInTheDocument();
  expect(screen.getByTestId('field')).toBeInTheDocument();
});

it('rendererが無いとエラー', () => {
  const mockLayout = vi.fn(({ children }) => (
    <div data-testid="layout">{children}</div>
  ));

  const fieldApi = {
    state: {
      value: 'abc',
      meta: { touchedErrors: [] },
    },
    handleChange: vi.fn(),
    handleBlur: vi.fn(),
  };
  expect(() =>
    render(
      <AutoField
        renderer={{}}
        fieldApi={fieldApi}
        meta={{ name: 'name', label: '名前', widget: 'text', options: {} }}
        layout={mockLayout}
      />,
    ),
  ).toThrow();
});
