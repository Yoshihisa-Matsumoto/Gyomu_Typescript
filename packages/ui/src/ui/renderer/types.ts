import { FormFieldMeta } from '@core/dsl/type';

export type FieldRenderer = (props: {
  meta: FormFieldMeta;
  value?: any;
  onChange?: (v: any) => void;
  onBlur?: () => void;
  error?: string;
}) => React.ReactNode;
