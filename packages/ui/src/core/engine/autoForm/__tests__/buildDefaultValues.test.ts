import { describe, it, expect } from 'vitest';
import { buildDefaultValues } from '../buildDefaultValues'; // パスは適宜調整
import { FormFieldMeta } from '@core/dsl';

describe('buildDefaultValues', () => {
  it('initialValuesがある場合はそれを優先する', () => {
    const fields: FormFieldMeta[] = [
      { name: 'age', widget: 'number', options: {} },
      { name: 'name', widget: 'text', options: {} },
    ];

    const initialValues = {
      age: 30,
      name: 'John',
    };

    const result = buildDefaultValues(fields, initialValues);

    expect(result).toEqual({
      age: 30,
      name: 'John',
    });
  });

  it('number widget は undefined になる', () => {
    const fields: FormFieldMeta[] = [
      { name: 'age', widget: 'number', options: {} },
    ];

    const result = buildDefaultValues(fields);

    expect(result).toEqual({
      age: undefined,
    });
  });

  it('default は空文字になる', () => {
    const fields: FormFieldMeta[] = [
      { name: 'name', widget: 'text', options: {} },
      { name: 'email', widget: 'text', options: {} },
    ];

    const result = buildDefaultValues(fields);

    expect(result).toEqual({
      name: '',
      email: '',
    });
  });

  it('initialValues が一部のみある場合はそれだけ上書きされる', () => {
    const fields: FormFieldMeta[] = [
      { name: 'age', widget: 'number', options: {} },
      { name: 'name', widget: 'text', options: {} },
    ];

    const initialValues = {
      name: 'Alice',
    };

    const result = buildDefaultValues(fields, initialValues);

    expect(result).toEqual({
      age: undefined,
      name: 'Alice',
    });
  });

  it('initialValues に未知のキーがあっても無視される', () => {
    const fields: FormFieldMeta[] = [
      { name: 'name', widget: 'text', options: {} },
    ];

    const initialValues = {
      name: 'Bob',
      unknown: 123,
    };

    const result = buildDefaultValues(fields, initialValues);

    expect(result).toEqual({
      name: 'Bob',
    });
  });

  it('fieldConfigs が空なら空オブジェクト', () => {
    const result = buildDefaultValues([]);

    expect(result).toEqual({});
  });
});
