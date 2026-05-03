import { describe, it, expect } from 'vitest';
import { getStructFields } from '../core/dsl/schemeAttribute.js'; // パス適宜

// ---- ダミーAST生成 ----
function createAST({
  required = true,
  annotations = {},
}: {
  required?: boolean;
  annotations?: Record<string, any>;
}) {
  return {
    _tag: 'TypeLiteral',
    propertySignatures: [],
    context: { isOptional: !required },
    annotations,
    checks: [],
  } as any;
}

// ---- ダミーPropertySignature ----
function createProperty(name: string, ast: any) {
  return {
    name,
    type: ast,
  } as any;
}

// ---- ダミーschemas ----
function createSchemas({
  fields,
  ui,
  astMap,
}: {
  fields: string[];
  ui?: any;
  astMap: Record<string, any>;
}) {
  const propertySignatures = fields.map((f) => createProperty(f, astMap[f]));

  return {
    selectSchema: { ast: { propertySignatures } },
    insertSchema: { ast: { propertySignatures } },
    updateSchema: { ast: { propertySignatures } },
    ui,
  } as any;
}

describe('getStructFields', () => {
  // -----------------------------
  // ① visible制御
  // -----------------------------
  it('visible=false のフィールドは除外される', () => {
    const schemas = createSchemas({
      fields: ['a', 'b'],
      astMap: {
        a: createAST({}),
        b: createAST({}),
      },
      ui: {
        a: { visible: true },
        b: { visible: false },
      },
    });

    const result = getStructFields(schemas, 'insert');

    expect(result.map((f) => f.name)).toEqual(['a']);
  });

  // -----------------------------
  // ② context override
  // -----------------------------
  it('contextごとにUIが切り替わる', () => {
    const schemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: createAST({}),
      },
      ui: {
        a: {
          default: { label: 'A' },
          create: { label: 'Create A' },
        },
      },
    });

    const result = getStructFields(schemas, 'insert');

    expect(result?.[0]?.label).toBe('Create A');
  });

  // -----------------------------
  // ③ default fallback
  // -----------------------------
  it('overrideが無い場合はdefaultが使われる', () => {
    const schemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: createAST({}),
      },
      ui: {
        a: {
          default: { label: 'Default A' },
        },
      },
    });

    const result = getStructFields(schemas, 'update');

    expect(result?.[0]?.label).toBe('Default A');
  });

  // -----------------------------
  // ④ required判定
  // -----------------------------
  it('requiredがASTから反映される', () => {
    const schemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: createAST({ required: true }),
      },
      ui: {
        a: { label: 'A' },
      },
    });

    const result = getStructFields(schemas, 'insert');

    expect(result?.[0]?.required).toBe(true);
  });

  it('optionalの場合required=falseになる', () => {
    const schemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: createAST({ required: false }),
      },
      ui: {
        a: { label: 'A' },
      },
    });

    const result = getStructFields(schemas, 'insert');

    expect(result?.[0]?.required).toBe(false);
  });

  // -----------------------------
  // ⑤ annotation → options
  // -----------------------------
  it('annotationsがoptionsにマージされる', () => {
    const schemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: createAST({
          annotations: { title: 'AAA' },
        }),
      },
      ui: {
        a: { label: 'A' },
      },
    });

    const result = getStructFields(schemas, 'insert');

    expect(result?.[0]?.options['title']).toBe('AAA');
  });

  // -----------------------------
  // ⑥ UI未定義は除外
  // -----------------------------
  it('UI未定義のフィールドは除外される', () => {
    const schemas = createSchemas({
      fields: ['a', 'b'],
      astMap: {
        a: createAST({}),
        b: createAST({}),
      },
      ui: {
        a: { label: 'A' },
      },
    });

    const result = getStructFields(schemas, 'insert');

    expect(result.map((f) => f.name)).toEqual(['a']);
  });

  it('string minLengthがoptionsに反映される', () => {
    const ast = createAST({});
    ast.checks = [
      {
        annotations: {
          toArbitraryConstraint: {
            string: { minLength: 3 },
          },
        },
      },
    ];

    const schemas = createSchemas({
      fields: ['a'],
      astMap: { a: ast },
      ui: { a: { label: 'A' } },
    });

    const result = getStructFields(schemas, 'insert');

    expect(result?.[0]?.options['string-minLength']).toBe(3);
  });

  it('visible=false は除外される', () => {
    const schemas = mockSchemas({
      fields: {
        name: stringSchema,
        age: numberSchema,
      },
      ui: {
        name: { label: '名前', visible: true, uiType: 'text' },
        age: { label: '年齢', visible: false, uiType: 'number' },
      },
    });

    const result = getStructFields(schemas, 'insert');

    expect(result.map((f) => f.name)).toEqual(['name']);
  });
});
