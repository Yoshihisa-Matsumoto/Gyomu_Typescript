import { Cause, Effect, Option, Schema } from 'effect';
import { describe, it, expect } from 'vitest';
import { convertToSchemaObjectWithEffect } from '../../entity/convert.js';
import { getFailureFromExit } from '../helper.js';

describe('SchemaValidationError test', () => {
  it('wraps SchemaError into SchemaValidationError', async () => {
    const schema = Schema.String;
    const effect = convertToSchemaObjectWithEffect('Test')(schema, 123);

    const result = await Effect.runPromiseExit(effect);

    expect(result._tag).toBe('Failure');

    if (result._tag === 'Failure') {
      const error = getFailureFromExit(result);

      expect(error._tag).toBe('SchemaErrorContext');
      expect(error.schemaName).toBe('Test');
      expect(error.phase).toBe('decode');
    }
  });

  it('keeps original SchemaError as cause', async () => {
    const schema = Schema.String;
    const effect = convertToSchemaObjectWithEffect('Test')(schema, 123);

    const exit = await Effect.runPromiseExit(effect);

    if (exit._tag === 'Failure') {
      const error = getFailureFromExit(exit);
      expect(error.cause).toBeDefined();
    }
  });

  it('includes schema issues', async () => {
    const schema = Schema.Struct({ a: Schema.Number });
    const effect = convertToSchemaObjectWithEffect('Test')(schema, { a: 'x' });

    const exit = await Effect.runPromiseExit(effect);

    if (exit._tag === 'Failure') {
      const error = getFailureFromExit(exit);

      expect(error.issues).toBeDefined();
    }
  });
});
