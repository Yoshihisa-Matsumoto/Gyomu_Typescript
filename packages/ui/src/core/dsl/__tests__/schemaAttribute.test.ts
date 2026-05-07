import { describe, it, expect } from 'vitest';
import { buildFormMetaFromStructSchema } from '../schemeAttribute.js'; // パス適宜
import {
  defineEntityCrudSchemas,
  EntityDefinition,
  Fields,
  schemaField,
} from '@gyomu/shared/entity';
import { logger } from '@gyomu/core';
//import { Schema } from 'effect';

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
  describe('visibility', () => {
    it('visible=false は除外されない', () => {
      const testSchemasDefinition = {
        fields: {
          name: schemaField.text({ maxLength: 50 }),
          age: schemaField.int(),
        },
        tags: {
          entity: 'test',
          sensitiveFields: ['name'] as const,
        },

        ui: {
          name: { label: '名前', visible: true, widget: 'text' },
          age: { label: '年齢', visible: false, widget: 'number' },
        },
      } as const satisfies EntityDefinition<Fields, false>;
      const testSchemas = defineEntityCrudSchemas(testSchemasDefinition);
      const result = buildFormMetaFromStructSchema({
        schema: testSchemas.insertSchema,
        ...(testSchemas.ui && { ui: testSchemas.ui }),
        uiContext: 'create',
        logger,
      });

      expect(result.map((f) => f.name)).toEqual(['name', 'age']);
      expect(result.find((f) => f.name == 'age')!.visible).toBeFalsy();
    });
    // -----------------------------
    // ⑥ UI未定義は除外
    // -----------------------------
    it('UI未定義のフィールドは除外されない', () => {
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

      const result = buildFormMetaFromStructSchema({
        schema: schemas.insertSchema,
        uiContext: 'create',
        logger,
        ui: schemas.ui,
      });

      expect(result.map((f) => f.name)).toEqual(['a', 'b']);
      const bAttribute = result.find((f) => f.name == 'b')!;
      expect(bAttribute.visible).toBeFalsy();
    });
    it('contextごとの visible override が効く', () => {
      const schemas = createSchemas({
        fields: ['a'],
        astMap: { a: createAST({}) },
        ui: {
          a: {
            default: { visible: true, label: 'A' },
            update: { visible: false },
          },
        },
      });

      const result = buildFormMetaFromStructSchema({
        schema: schemas.updateSchema,
        uiContext: 'update',
        logger,
        ui: schemas.ui,
      });

      expect(result.length).toBe(1);
      expect(result[0]?.visible).toBeFalsy();
    });
  });

  describe('UI context override (default/create/update/view)', () => {
    const baseSchemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: createAST({}),
      },
      ui: {
        a: {
          default: { label: 'Default A' },
          create: { label: 'Create A' },
          update: { label: 'Update A' },
          view: { label: 'View A' },
        },
      },
    });

    it('create → createが優先される', () => {
      const result = buildFormMetaFromStructSchema({
        schema: baseSchemas.insertSchema,
        uiContext: 'create',
        logger,
        ui: baseSchemas.ui,
      });
      expect(result[0]!.label).toBe('Create A');
    });

    it('update → updateが優先される', () => {
      const result = buildFormMetaFromStructSchema({
        schema: baseSchemas.updateSchema,
        uiContext: 'update',
        logger,
        ui: baseSchemas.ui,
      });
      expect(result[0]!.label).toBe('Update A');
    });

    it('view → viewが優先される', () => {
      const result = buildFormMetaFromStructSchema({
        schema: baseSchemas.selectSchema,
        uiContext: 'view',
        logger,
        ui: baseSchemas.ui,
      });
      expect(result[0]!.label).toBe('View A');
    });

    it('overrideが無い場合はdefault', () => {
      const schemas = createSchemas({
        fields: ['a'],
        astMap: { a: createAST({}) },
        ui: {
          a: {
            default: { label: 'Default A' },
            // create/update/viewなし
          },
        },
      });

      const result = buildFormMetaFromStructSchema({
        schema: schemas.updateSchema,
        uiContext: 'update',
        logger,
        ui: schemas.ui,
      });
      expect(result[0]!.label).toBe('Default A');
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

      const result = buildFormMetaFromStructSchema({
        schema: schemas.insertSchema,
        uiContext: 'create',
        logger,
        ui: schemas.ui,
      });

      expect(result?.[0]?.label).toBe('Create A');
    });
  });

  describe('required / optional', () => {
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

      const result = buildFormMetaFromStructSchema({
        schema: schemas.insertSchema,
        uiContext: 'create',
        logger,
        ui: schemas.ui,
      });

      expect(result?.[0]?.required).toBe(true);
    });

    it('required が schema から反映される', () => {
      const testSchemasDefinition = {
        fields: {
          name: schemaField.text({ maxLength: 50 }),
          address: schemaField.optionalText(),
        },
        tags: {
          entity: 'test',
          sensitiveFields: ['name'] as const,
        },

        ui: {
          name: { label: '名前', visible: true, widget: 'text' },
          address: { label: '住所', visible: true, widget: 'text' },
        },
      } as const satisfies EntityDefinition<Fields, false>;
      const testSchemas = defineEntityCrudSchemas(testSchemasDefinition);
      //type testType = typeof testSchemas.types._insert;
      const result = buildFormMetaFromStructSchema({
        schema: testSchemas.insertSchema,
        uiContext: 'create',
        logger,
        ...(testSchemas.ui && { ui: testSchemas.ui }),
      });
      expect(result.find((f) => f.name === 'name')?.required).toBe(true);
      expect(result.find((f) => f.name === 'address')?.required).toBe(false);
    });
  });

  describe('annotation merge', () => {
    // -----------------------------
    // ⑤ annotation → options
    // -----------------------------
    it('titleがoptionsに入る', () => {
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

      const result = buildFormMetaFromStructSchema({
        schema: schemas.insertSchema,
        uiContext: 'create',
        logger,
        ...(schemas.ui && { ui: schemas.ui }),
      });

      expect(result?.[0]?.options['title']).toBe('AAA');
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

      const result = buildFormMetaFromStructSchema({
        schema: schemas.insertSchema,
        uiContext: 'create',
        logger,
        ...(schemas.ui && { ui: schemas.ui }),
      });

      expect(result?.[0]?.options['string-minLength']).toBe(3);
    });
  });

  describe('fallback behavior', () => {
    it('label fallback が効く', () => {
      const testSchemasDefinition = {
        fields: {
          name: schemaField.text({ maxLength: 50 }),
          address: schemaField.optionalText(),
        },
        tags: {
          entity: 'test',
          sensitiveFields: ['name'] as const,
        },

        ui: {
          name: { label: '名前', visible: true, widget: 'text' },
          address: { visible: true, widget: 'number' },
        },
      } as const satisfies EntityDefinition<Fields, false>;
      const testSchemas = defineEntityCrudSchemas(testSchemasDefinition);
      // type testType = typeof testSchemas.types._insert;
      const result = buildFormMetaFromStructSchema({
        schema: testSchemas.insertSchema,
        uiContext: 'create',
        logger,
        ...(testSchemas.ui && { ui: testSchemas.ui }),
      });

      expect(result.find((f) => f.name === 'name')?.label).toBe('名前');
      expect(result.find((f) => f.name === 'address')?.label).toBe('address');
    });
    it('placeholder fallback が効く', () => {
      const testSchemasDefinition = {
        fields: {
          name: schemaField.text({ maxLength: 50 }),
          address: schemaField.optionalText(),
        },
        tags: {
          entity: 'test',
          sensitiveFields: ['name'] as const,
        },

        ui: {
          name: { placeholder: '名前', visible: true, widget: 'text' },
          address: { visible: true, widget: 'number' },
        },
      } as const satisfies EntityDefinition<Fields, false>;
      const testSchemas = defineEntityCrudSchemas(testSchemasDefinition);
      // type testType = typeof testSchemas.types._insert;
      const result = buildFormMetaFromStructSchema({
        schema: testSchemas.insertSchema,
        uiContext: 'create',
        logger,
        ...(testSchemas.ui && { ui: testSchemas.ui }),
      });

      expect(result.find((f) => f.name === 'name')?.placeholder).toBe('名前');
      expect(result.find((f) => f.name === 'address')?.placeholder).toBe(
        'address',
      );
    });
  });
});

describe('enum validation', () => {
  it('select widget + enumAttribute が schema enum と一致する', () => {
    const unionAst = {
      _tag: 'Union',
      types: [
        { _tag: 'Literal', literal: 'admin' },
        { _tag: 'Literal', literal: 'user' },
      ],
    };

    const schemas = createSchemas({
      fields: ['role'],
      astMap: {
        role: unionAst,
      },
      ui: {
        role: {
          widget: 'select',
          enumAttribute: {
            admin: { label: 'Admin' },
            user: { label: 'User' },
          },
        },
      },
    });

    expect(() =>
      buildFormMetaFromStructSchema({
        schema: schemas.insertSchema,
        uiContext: 'create',
        logger,
        ui: schemas.ui,
      }),
    ).not.toThrow();
  });

  it('enumAttribute が不足していると throw', () => {
    const unionAst = {
      _tag: 'Union',
      types: [
        { _tag: 'Literal', literal: 'admin' },
        { _tag: 'Literal', literal: 'user' },
      ],
    };

    const schemas = createSchemas({
      fields: ['role'],
      astMap: {
        role: unionAst,
      },
      ui: {
        role: {
          widget: 'select',
          enumAttribute: {
            admin: { label: 'Admin' },
          },
        },
      },
    });

    expect(() =>
      buildFormMetaFromStructSchema({
        schema: schemas.insertSchema,
        uiContext: 'create',
        logger,
        ui: schemas.ui,
      }),
    ).toThrow(/enumAttribute missing/);
  });
});

describe('union annotation merge', () => {
  it('Union配下の annotations が merge される', () => {
    const schemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: {
          _tag: 'Union',
          types: [
            {
              _tag: 'StringKeyword',
              annotations: {
                title: 'AAA',
              },
              checks: [],
            },
            {
              _tag: 'StringKeyword',
              annotations: {
                description: 'BBB',
              },
              checks: [],
            },
          ],
        },
      },
      ui: {
        a: { label: 'A' },
      },
    });

    const result = buildFormMetaFromStructSchema({
      schema: schemas.insertSchema,
      uiContext: 'create',
      logger,
      ui: schemas.ui,
    });

    expect(result[0]?.options['title']).toBe('AAA');
    expect(result[0]?.options['description']).toBe('BBB');
  });
});

describe('null handling', () => {
  it('Null type は required=false になる', () => {
    const schemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: {
          _tag: 'Null',
          annotations: {},
          checks: [],
        },
      },
      ui: {
        a: { label: 'A' },
      },
    });

    const result = buildFormMetaFromStructSchema({
      schema: schemas.insertSchema,
      uiContext: 'create',
      logger,
      ui: schemas.ui,
    });

    expect(result[0]?.required).toBe(false);
  });
});

describe('constraint extraction', () => {
  it('number constraint が options に反映される', () => {
    const ast = createAST({});
    ast.checks = [
      {
        annotations: {
          toArbitraryConstraint: {
            number: {
              min: 1,
              max: 10,
              isInteger: true,
            },
          },
        },
      },
    ];

    const schemas = createSchemas({
      fields: ['age'],
      astMap: { age: ast },
      ui: {
        age: { label: 'Age' },
      },
    });

    const result = buildFormMetaFromStructSchema({
      schema: schemas.insertSchema,
      uiContext: 'create',
      logger,
      ui: schemas.ui,
    });

    expect(result[0]?.options['number-min']).toBe(1);
    expect(result[0]?.options['number-max']).toBe(10);
    expect(result[0]?.options['number-isInteger']).toBe(true);
  });

  it('array constraint が options に反映される', () => {
    const ast = createAST({});
    ast.checks = [
      {
        annotations: {
          toArbitraryConstraint: {
            array: {
              minLength: 1,
              maxLength: 5,
            },
          },
        },
      },
    ];

    const schemas = createSchemas({
      fields: ['tags'],
      astMap: { tags: ast },
      ui: {
        tags: { label: 'Tags' },
      },
    });

    const result = buildFormMetaFromStructSchema({
      schema: schemas.insertSchema,
      uiContext: 'create',
      logger,
      ui: schemas.ui,
    });

    expect(result[0]?.options['array-minLength']).toBe(1);
    expect(result[0]?.options['array-maxLength']).toBe(5);
  });
});

describe('fallback hidden widget', () => {
  it('ui未指定の場合 hidden widget になる', () => {
    const schemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: createAST({}),
      },
    });

    const result = buildFormMetaFromStructSchema({
      schema: schemas.insertSchema,
      uiContext: 'create',
      logger,
    });

    expect(result[0]?.widget).toBe('hidden');
    expect(result[0]?.label).toBe('a');
  });
});

describe('override merge', () => {
  it('default + override が merge される', () => {
    const schemas = createSchemas({
      fields: ['a'],
      astMap: {
        a: createAST({}),
      },
      ui: {
        a: {
          default: {
            label: 'AAA',
            placeholder: 'PLACE',
            visible: true,
          },
          update: {
            label: 'BBB',
          },
        },
      },
    });

    const result = buildFormMetaFromStructSchema({
      schema: schemas.updateSchema,
      uiContext: 'update',
      logger,
      ui: schemas.ui,
    });

    expect(result[0]?.label).toBe('BBB');
    expect(result[0]?.placeholder).toBe('PLACE');
    expect(result[0]?.visible).toBe(true);
  });
});
