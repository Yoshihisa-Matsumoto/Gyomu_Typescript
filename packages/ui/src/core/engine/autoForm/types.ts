import type { LocalDate, UIAnnotationByWidget, UIAnnotationMap } from '@gyomu/schema/entity'

// type BaseFieldProps<T> = {
//   value: T | undefined;
//   onChange?: (v: T | undefined) => void;
//   onBlur?: () => void;
//   meta: FormFieldMeta;
// };

// type FieldPropsMap = {
//   text: BaseFieldProps<string>;
//   'email-text': BaseFieldProps<string>;
//   'password-text': BaseFieldProps<string>;

//   textarea: BaseFieldProps<string>;

//   number: BaseFieldProps<number>;

//   select: BaseFieldProps<string> & {
//     options: { value: string; label: string }[];
//   };

//   date: BaseFieldProps<string>;

//   hidden: BaseFieldProps<string>;
// };

// export type StrictFieldPropsMap = {
//   [K in keyof FieldPropsMap]: (props: FieldPropsMap[K]) => JSX.Element;
// };
// export type FieldRendererMap = {
//   [K in FieldType]: FieldRenderer;
// };

type WidgetValueMap = {
  text: string
  textarea: string
  number: number
  date: LocalDate
  select: string
  hidden: string
}

type WidgetValue<K extends keyof WidgetValueMap> = WidgetValueMap[K]

export type RendererMap = {
  [K in keyof UIAnnotationMap]: React.ComponentType<{
    meta: UIAnnotationByWidget<K>
    value: WidgetValue<K>
    onChange?: (value: WidgetValue<K> | undefined) => void
    onBlur?: (value: WidgetValue<K> | undefined) => void
  }>
}
