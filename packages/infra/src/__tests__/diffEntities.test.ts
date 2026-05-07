import { describe, it, expect } from 'vitest';
import { diffEntities } from '@gyomu/core/data'; // パス調整
import { AppInfoSchema } from '@gyomu/core/schemas/gyomu';
//import { testSchemas } from './helpers/schema';

describe('diffEntities', () => {
  type Insert = {
    name: string;
    date: string;
  };

  type Select = Insert & {
    id: string;
  };

  type Update = Insert & {
    id: string;
  };

  const testSchemas = {
    insertSchema: {} as any,
    selectSchema: {} as any,
    updateSchema: {} as any,
    updatefieldNames: ['name', 'date'] as const,
  } as any;

  const getKey = (v: any) => v.name; // 今回はnameをキーに
  const diff = diffEntities(testSchemas);

  it('新規データは inserts に入る', () => {
    const result = diff<Insert, Select, Update, keyof Insert>({
      incoming: [{ name: 'A', date: '2024-01-01' }],
      existing: [],
      getKey,
    });

    expect(result.inserts).toHaveLength(1);
    expect(result.updates).toHaveLength(0);
    expect(result.deletes).toHaveLength(0);
    expect(result.unchanged).toHaveLength(0);
  });

  it('既存にあって差分なしは unchanged', () => {
    const result = diff<Insert, Select, Update, keyof Insert>({
      incoming: [{ name: 'A', date: '2024-01-01' }],
      existing: [{ id: '1', name: 'A', date: '2024-01-01' }],
      getKey,
    });

    expect(result.inserts).toHaveLength(0);
    expect(result.updates).toHaveLength(0);
    expect(result.deletes).toHaveLength(0);
    expect(result.unchanged).toHaveLength(1);

    expect(result.unchanged[0]!.incoming).toEqual({
      id: '1',
      name: 'A',
      date: '2024-01-01',
    });
  });

  it('差分がある場合は updates に入る', () => {
    const result = diff<Insert, Select, Update, keyof Insert>({
      incoming: [{ name: 'A', date: '2024-02-01' }],
      existing: [{ id: '1', name: 'A', date: '2024-01-01' }],
      getKey,
    });

    expect(result.updates).toHaveLength(1);

    const update = result.updates[0]!;

    expect(update.changedFields).toEqual(['date']);
    expect(update.changedValues).toEqual({
      id: '1',
      date: '2024-02-01',
    });
  });

  it('existingのみに存在する場合は deletes に入る', () => {
    const result = diff<Insert, Select, Update, keyof Insert>({
      incoming: [],
      existing: [{ id: '1', name: 'A', date: '2024-01-01' }],
      getKey,
    });

    expect(result.deletes).toHaveLength(1);
    expect(result.deletes[0]!.id).toBe('1');
  });

  it('複合ケース（insert/update/delete混在）', () => {
    const result = diff<Insert, Select, Update, keyof Insert>({
      incoming: [
        { name: 'A', date: '2024-01-01' }, // unchanged
        { name: 'B', date: '2024-02-01' }, // update
        { name: 'C', date: '2024-03-01' }, // insert
      ],
      existing: [
        { id: '1', name: 'A', date: '2024-01-01' },
        { id: '2', name: 'B', date: '2024-01-01' },
        { id: '3', name: 'D', date: '2024-01-01' }, // delete対象
      ],
      getKey,
    });

    expect(result.inserts).toHaveLength(1);
    expect(result.updates).toHaveLength(1);
    expect(result.deletes).toHaveLength(1);
    expect(result.unchanged).toHaveLength(1);
  });

  it('Object.isの挙動（NaNも差分検知できる）', () => {
    const diffNaN = diff<
      { value: number },
      { id: string; value: number },
      { id: string; value: number },
      'value'
    >({
      incoming: [{ value: NaN }],
      existing: [{ id: '1', value: NaN }],
      getKey: () => 'key',
    });

    expect(diffNaN.updates).toHaveLength(0);
    expect(diffNaN.unchanged).toHaveLength(1);
  });
});

describe('diffEntities × AppInfoSchema (mailFromAddress)', () => {
  type Insert = {
    description: string;
    mailFromAddress: string | null;
    mailFromName: string | null;
  };

  type Select = Insert & {
    id: string;
  };

  type Update = Partial<Insert> & {
    id: string;
  };

  const getKey = () => 'fixed-key'; // 今回は1レコード前提
  const diff = diffEntities(AppInfoSchema);

  it('① mailFromAddress: 別の値に変更 → updateされる', () => {
    const result = diff<Insert, Select, Update, keyof Insert>({
      incoming: [
        {
          description: 'test',
          mailFromAddress: 'new@example.com',
          mailFromName: null,
        },
      ],
      existing: [
        {
          id: '1',
          description: 'test',
          mailFromAddress: 'old@example.com',
          mailFromName: null,
        },
      ],
      getKey,
    });

    expect(result.updates).toHaveLength(1);

    const update = result.updates[0]!;

    expect(update.changedFields).toContain('mailFromAddress');
    expect(update.changedValues).toEqual({
      id: '1',
      mailFromAddress: 'new@example.com',
    });
    console.log(JSON.stringify(result, null, 2));
  });

  it('② mailFromAddress: 値 → null に変更 → updateされる', () => {
    const result = diff<Insert, Select, Update, keyof Insert>({
      incoming: [
        {
          description: 'test',
          mailFromAddress: null,
          mailFromName: null,
        },
      ],
      existing: [
        {
          id: '1',
          description: 'test',
          mailFromAddress: 'old@example.com',
          mailFromName: null,
        },
      ],
      getKey,
    });

    expect(result.updates).toHaveLength(1);

    const update = result.updates[0]!;

    expect(update.changedFields).toContain('mailFromAddress');
    expect(update.changedValues).toEqual({
      id: '1',
      mailFromAddress: null,
    });
    console.log(JSON.stringify(result, null, 2));
  });

  it('④ mailFromAddress: undefined は変更しない（差分にならない）', () => {
    const result = diff<Insert, Select, Update, keyof Insert>({
      incoming: [
        {
          id: '1',
          description: 'test',
          mailFromName: null,
        },
      ],
      existing: [
        {
          id: '1',
          description: 'test',
          mailFromAddress: 'old@example.com',
          mailFromName: null,
        },
      ],
      getKey,
    });

    // updateされないこと
    expect(result.updates).toHaveLength(0);

    // unchangedに入ること
    expect(result.unchanged).toHaveLength(1);

    // existingの値が維持されていること
    expect(result.unchanged[0]?.existing.mailFromAddress).toBe(
      'old@example.com',
    );
  });
});
