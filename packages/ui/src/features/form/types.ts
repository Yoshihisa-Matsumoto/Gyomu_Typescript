import { FormFieldMeta } from '@core/dsl';
import { FieldApi } from '@tanstack/react-form';
import { FieldLayout } from '@ui/components';
import { FieldRenderer } from '@ui/renderer';

export type FieldController<T> = {
  value: T;
  onChange: (value: T) => void;
  onBlur?: () => void;

  error?: string;
};
export type SimpleFieldType<TValue = any> = FieldApi<
  any,
  any,
  TValue,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;
export type AutoFieldProps<TValue = any> = {
  fieldApi: SimpleFieldType<TValue>;
  meta: FormFieldMeta;
  renderer?: Record<string, FieldRenderer>;
  layout: FieldLayout;
};
