import { UIAnnotation } from '@gyomu/core/shared/entity';
export type FormFieldMeta = UIAnnotation & {
  name: string;
  options: Record<string, any>;
  required?: boolean;
};
