import { FieldController, SimpleFieldType } from './types';

export function createFieldController<T>(
  fieldApi: SimpleFieldType<T>,
): FieldController<T> {
  return {
    value: fieldApi.state.value,
    onChange: fieldApi.handleChange,
    onBlur: fieldApi.handleBlur,
    error: fieldApi.state.meta.errors?.[0],
  };
}
