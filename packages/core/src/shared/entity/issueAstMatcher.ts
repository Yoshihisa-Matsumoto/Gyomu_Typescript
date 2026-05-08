import { SchemaIssue } from 'effect';
import { CrudSchemaType, Fields } from './type.js';
import { makeFormatterStandardSchemaV1 } from 'effect/SchemaIssue';

export const resolveFieldErrorsFromIssue = <TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
  issue: SchemaIssue.Issue,
) => {
  const flat = flattenIssues(issue);

  const result: Record<string, string[]> = {};

  for (const i of flat) {
    const field = resolveField(schema, i.path);

    if (!field) continue;

    if (!result[field]) result[field] = [];
    result[field].push(i.message);
  }
  console.log(JSON.stringify(result, null, 2));
  return result;
};

const resolveField = <TFields extends Fields>(
  schema: CrudSchemaType<TFields, boolean>,
  path?: ReadonlyArray<PropertyKey>,
): string | undefined => {
  const normalized = normalizePath(path);
  const key = normalized[0];
  if (!key) return;

  for (const field of schema.ast.propertySignatures) {
    // UI名
    if (field.name === key) return field.name;

    // keyMapping
    // const mapped = schema..keyMapping?.[field.name];
    // if (mapped === key) return field.name;
  }
};

export const flattenIssues = (issue: SchemaIssue.Issue) => {
  const result = makeFormatterStandardSchemaV1()(issue);
  return result.issues.map((f) => ({
    path: normalizePath(f.path as any as PropertyKey[] | undefined),
    message: f.message,
  }));
};
const normalizePath = (path?: ReadonlyArray<PropertyKey>): string[] => {
  if (!path) return [];

  return path
    .map((p) => {
      if (typeof p === 'string') return p;
      if (typeof p === 'number') return String(p);

      // PathSegment対応（Effect特有）
      if (typeof p === 'object' && p !== null) {
        if ('key' in p) return String((p as any).key);
      }
    })
    .filter((v): v is string => !!v);
};
