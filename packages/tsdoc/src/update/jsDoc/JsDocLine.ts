export type JsDocLine =
  | { type: 'text'; text: string }
  | { type: 'tag'; text: string }
  | { type: 'blank' }
