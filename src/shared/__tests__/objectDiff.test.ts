import { describe, it, expect } from 'vitest';
import { reconcile, reconcileDetail } from '../object/diff.js';

describe('reconcile', () => {
  it('差分なしの場合は空配列', () => {
    const a = { x: 1, y: 2 };
    const b = { x: 1, y: 2 };

    expect(reconcile(a, b)).toEqual([]);
  });

  it('値が異なる場合', () => {
    const a = { x: 1 };
    const b = { x: 2 };

    expect(reconcile(a, b)).toEqual([{ field: 'x', valA: 1, valB: 2 }]);
  });

  it('Aにのみ存在するキー', () => {
    const a = { x: 1 };
    const b = {};

    expect(reconcile(a, b)).toEqual([{ field: 'x', valA: 1 }]);
  });

  it('Bにのみ存在するキー', () => {
    const a = {};
    const b = { x: 1 };

    expect(reconcile(a, b)).toEqual([{ field: 'x', valB: 1 }]);
  });

  it('型違いでも != 比較で差分検出される', () => {
    const a = { x: 1 };
    const b = { x: '1' };

    expect(reconcile(a, b)).toEqual([]); // ←ここ重要（!=なので同じ扱い）
  });
});

describe('reconcileDetail', () => {
  it('差分なし', () => {
    const a = { x: 1 };
    const b = { x: 1 };

    expect(reconcileDetail(a, b)).toEqual([]);
  });

  it('単純な差分', () => {
    const a = { x: 1 };
    const b = { x: 2 };

    expect(reconcileDetail(a, b)).toEqual([
      {
        path: 'x',
        sourceValue: '1',
        destinationValue: '2',
      },
    ]);
  });

  it('ネストされた差分', () => {
    const a = { obj: { x: 1 } };
    const b = { obj: { x: 2 } };

    expect(reconcileDetail(a, b)).toEqual([
      {
        path: 'obj::x',
        sourceValue: '1',
        destinationValue: '2',
      },
    ]);
  });

  it('Aにのみ存在するキー', () => {
    const a = { x: 1 };
    const b = {};

    expect(reconcileDetail(a, b)).toEqual([
      {
        path: 'x',
        sourceValue: 1,
        destinationValue: '',
      },
    ]);
  });

  it('Bにのみ存在するキー', () => {
    const a = {};
    const b = { x: 1 };

    expect(reconcileDetail(a, b)).toEqual([
      {
        path: 'x',
        sourceValue: '',
        destinationValue: 1,
      },
    ]);
  });

  it('parentPathが正しく連結される', () => {
    const a = { x: 1 };
    const b = { x: 2 };

    expect(reconcileDetail(a, b, 'root')).toEqual([
      {
        path: 'root::x',
        sourceValue: '1',
        destinationValue: '2',
      },
    ]);
  });

  it('オブジェクト同士の場合は再帰される', () => {
    const a = { obj: { x: 1, y: 2 } };
    const b = { obj: { x: 1, y: 3 } };

    expect(reconcileDetail(a, b)).toEqual([
      {
        path: 'obj::y',
        sourceValue: '2',
        destinationValue: '3',
      },
    ]);
  });
});
