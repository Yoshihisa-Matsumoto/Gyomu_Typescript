// --- Shared / Core (ドメイン・基盤) ---
import {
  CrudSchemaType,
  Fields,
  UIAnnotations,
} from '@gyomu/core/shared/entity';
import { Logger } from '@gyomu/core';

// --- UI (抽象コンポーネント) ---
import {
  FieldLayout,
  FormLayout,
  SubmitButtonProps,
} from '../../ui/components';

// --- ローカル ---
import { FormFieldMeta } from '../../core/dsl/type';
import { RendererMap } from '../../core/engine/autoForm/types';

export type AutoFieldProps = {
  meta: FormFieldMeta;
  renderer?: RendererMap;
  layout: FieldLayout;
  value?: unknown;
  onBlur?: (v: any) => void;
  onChange?: (v: any) => void;
  error?: string;
};

export type AutoFormProps<TFields extends Fields> = {
  schema: CrudSchemaType<TFields, boolean>;
  uiContext: 'view' | 'create' | 'update';
  logger?: Logger;
  ui: UIAnnotations<TFields>;
  initialValues?: Record<string, any>;
  onSubmit: (data: any) => void | Promise<void>;

  fieldRenderer?: RendererMap;
  fieldLayout?: FieldLayout;
  layout?: FormLayout;

  components?: {
    SubmitButton?: React.ComponentType<SubmitButtonProps>;
  };
};
