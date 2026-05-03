import { UIAnnotation } from '@gyomu/shared/entity';
export type FormFieldMeta = UIAnnotation & {
  name: string;
  options: Record<string, any>;
  required?: boolean;
};
