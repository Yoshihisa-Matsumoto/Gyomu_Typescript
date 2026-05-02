import { describe, it, expect } from 'vitest';
import { Effect, Schema } from 'effect';
import {
  jsonString2SchemaObjectWithoutEffect,
  convertToSchemaObjectWithEffect,
  convertFromSchemaObjectWithEffect,
} from '../entity/convert.js';

// ---- スキーマ ----
const UserSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
});

describe('jsonString2SchemaObjectWithoutEffect', () => {
  it('正常系: JSON文字列をSchemaオブジェクトに変換できる', () => {
    const json = JSON.stringify({ id: 1, name: 'Alice' });

    const result = jsonString2SchemaObjectWithoutEffect(UserSchema, json);

    expect(result).toEqual({ id: 1, name: 'Alice' });
  });

  it('異常系: 不正なJSONで例外が投げられる', () => {
    const invalidJson = '{ id: 1, name: Alice }';

    expect(() =>
      jsonString2SchemaObjectWithoutEffect(UserSchema, invalidJson),
    ).toThrow();
  });

  it('異常系: schemaに合わない場合例外が投げられる', () => {
    const json = JSON.stringify({ id: 'invalid', name: 'Alice' });

    expect(() =>
      jsonString2SchemaObjectWithoutEffect(UserSchema, json),
    ).toThrow();
  });
});

describe('convertToSchemaObjectWithEffect', () => {
  const convert = convertToSchemaObjectWithEffect('UserSchema');

  it('正常系: 正しい入力をデコードできる', async () => {
    const effect = convert(UserSchema, { id: 1, name: 'Bob' });

    const result = await Effect.runPromise(effect);

    expect(result).toEqual({ id: 1, name: 'Bob' });
  });

  it('異常系: 不正な入力でAppErrorに変換される', async () => {
    const effect = convert(UserSchema, { id: 'invalid', name: 'Bob' });

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: 'SchemaErrorContext',
    });
  });
});

describe('convertFromSchemaObjectWithEffect', () => {
  const convert = convertFromSchemaObjectWithEffect('UserSchema');

  it('正常系: 正しいオブジェクトをエンコードできる', async () => {
    const input = { id: 2, name: 'Charlie' };

    const effect = convert(UserSchema, input);

    const result = await Effect.runPromise(effect);

    expect(result).toEqual(input);
  });

  it('異常系: 不正なオブジェクトでAppErrorに変換される', async () => {
    const invalidInput = { id: 'invalid', name: 'Charlie' } as any;

    const effect = convert(UserSchema, invalidInput);

    await expect(Effect.runPromise(effect)).rejects.toMatchObject({
      _tag: 'SchemaErrorContext',
    });
  });
});
