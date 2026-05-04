import { Schema } from 'effect';

export function validateWithSchema(schema: Schema.Schema<any>, value: any) {
  try {
    // Effect Schema の decode API に合わせて調整
    console.log('validate', value);
    const data = Schema.decodeSync(Schema.toType(schema))(value);
    return { ok: true as const, data };
  } catch (error: any) {
    return {
      ok: false as const,
      errors: { _form: error.message ?? 'Validation error' },
    };
  }
}
