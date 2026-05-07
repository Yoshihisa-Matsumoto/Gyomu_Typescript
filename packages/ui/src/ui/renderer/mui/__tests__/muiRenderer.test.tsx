import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import { muiRenderer } from '../muiRenderer';

it('text renderer が入力を onChange に渡す', () => {
  const handleChange = vi.fn();

  const Component = muiRenderer['text'];
  expect(Component).toBeDefined();
  if (!Component) throw new Error('Not expected');
  render(
    <Component
      value=""
      onChange={handleChange}
      onBlur={() => {}}
      meta={{ label: '名前', widget: 'text' as const }}
    />,
  );

  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'abc' },
  });

  expect(handleChange).toHaveBeenCalledWith('abc');
});
