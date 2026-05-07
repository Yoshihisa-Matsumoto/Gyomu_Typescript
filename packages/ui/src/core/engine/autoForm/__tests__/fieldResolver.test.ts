import { describe, it, expect } from 'vitest';
import { resolveFieldType } from '../fieldResolver'; // パス適宜
import { FormFieldMeta } from '@core/dsl';

describe('resolveFieldType', () => {
  describe('text widget', () => {
    it('format=email の場合 email-text を返す', () => {
      const meta: FormFieldMeta = {
        widget: 'text',
        format: 'email',
        name: 'email',
        options: {},
      };

      expect(resolveFieldType(meta)).toBe('email-text');
    });

    it('format=password の場合 password-text を返す', () => {
      const meta: FormFieldMeta = {
        widget: 'text',
        format: 'password',
        name: 'password',
        options: {},
      };

      expect(resolveFieldType(meta)).toBe('password-text');
    });

    it('format 未指定の場合 text を返す', () => {
      const meta: FormFieldMeta = {
        widget: 'text',
        name: 'name',
        options: {},
      };

      expect(resolveFieldType(meta)).toBe('text');
    });

    it('未知の format の場合も text を返す', () => {
      const meta: FormFieldMeta = {
        widget: 'text',
        format: 'phone',
        name: 'unknown',
        options: {},
      };

      expect(resolveFieldType(meta)).toBe('text');
    });
  });

  describe('other widgets', () => {
    it('number は number を返す', () => {
      expect(
        resolveFieldType({ widget: 'number', name: 'age', options: {} }),
      ).toBe('number');
    });

    it('textarea は textarea を返す', () => {
      expect(
        resolveFieldType({
          widget: 'textarea',
          name: 'description',
          options: {},
        }),
      ).toBe('textarea');
    });

    it('date は date を返す', () => {
      expect(
        resolveFieldType({ widget: 'date', name: 'createDate', options: {} }),
      ).toBe('date');
    });

    it('select は select を返す', () => {
      expect(
        resolveFieldType({
          widget: 'select',
          name: 'jobType',
          options: {},
          enumAttribute: {
            option1: { label: 'Option 1' },
            option2: { label: 'Option 2' },
          },
        }),
      ).toBe('select');
    });
  });

  describe('error cases', () => {
    it('未対応 widget の場合エラーを投げる', () => {
      const meta = {
        widget: undefined,
        name: 'email',
        options: {},
      };

      expect(() => resolveFieldType(meta as any)).toThrowError('Unsupported');
    });
  });
});
