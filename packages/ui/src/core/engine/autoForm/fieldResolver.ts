import { FormFieldMeta } from '@core/dsl/type';

export type FieldType =
  | 'email-text'
  | 'password-text'
  | 'text'
  | 'number'
  | 'textarea'
  | 'date'
  | 'select'
  | 'hidden';

export type FieldResolver = (meta: FormFieldMeta) => FieldType;

export const resolveFieldType: FieldResolver = (meta) => {
  switch (meta.widget) {
    case 'text':
      if (meta.format === 'email') return 'email-text';
      if (meta.format === 'password') return 'password-text';
      return 'text';
    case 'number':
      return 'number';
    case 'textarea':
      return 'textarea';
    case 'date':
      return 'date';
    case 'select':
      return 'select';
    case 'hidden':
      return 'hidden';
    default:
      throw new Error('Unsupported');
  }
};
