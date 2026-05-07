import { FieldRenderer } from '@ui/renderer';
import { FieldType } from './fieldType';
import { FormFieldMeta } from '@core/dsl/type';
import { JSX } from 'react';

type BaseFieldProps<T> = {
  value: T | undefined;
  onChange?: (v: T | undefined) => void;
  onBlur?: () => void;
  meta: FormFieldMeta;
};

type FieldPropsMap = {
  text: BaseFieldProps<string>;
  'email-text': BaseFieldProps<string>;
  'password-text': BaseFieldProps<string>;

  textarea: BaseFieldProps<string>;

  number: BaseFieldProps<number>;

  select: BaseFieldProps<string> & {
    options: { value: string; label: string }[];
  };

  date: BaseFieldProps<string>;

  hidden: BaseFieldProps<string>;
};

export type StrictFieldPropsMap = {
  [K in keyof FieldPropsMap]: (props: FieldPropsMap[K]) => JSX.Element;
};
export type FieldRendererMap = {
  [K in FieldType]: FieldRenderer;
};
