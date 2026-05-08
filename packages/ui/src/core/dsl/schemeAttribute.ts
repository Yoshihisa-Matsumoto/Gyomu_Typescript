import {
  CrudSchemaType,
  Fields,
  UIAnnotation,
  UIAnnotationField,
  UIAnnotationOverride,
  UIAnnotations,
} from '@gyomu/core/entity';
import { AST, Check } from 'effect/SchemaAST';
import { logger, Logger } from '@gyomu/core';
import { FormFieldMeta } from './type.js';

function getMergedAnnotations(
  name: string,
  schema: AST,
  inputResult: Record<string, any>,
  logger?: Logger,
): Record<string, any> {
  const ast = schema;
  //logger?.debug({ name, ast }, 'AST');
  let result: Record<string, any> = inputResult;
  if (ast._tag == 'Null') {
    result['required'] = false;
  }
  if (ast.annotations) {
    //logger?.debug(ast.annotations, 'Annotation exists');
    Object.assign(result, ast.annotations);
  }

  const checks = ast.checks;
  if (Array.isArray(checks)) {
    //logger?.debug(checks, 'checks exists');
    for (const item of checks) {
      const check: Check<any> = item;
      if (check.annotations) {
        //logger?.debug(check.annotations, 'Check Annotation exists');
        if (check.annotations.toArbitraryConstraint) {
          const constraint = check.annotations.toArbitraryConstraint;
          if (constraint.array) {
            const parent = 'array';
            if (constraint.array.maxLength)
              result[`${parent}-maxLength`] = constraint.array.maxLength;
            if (constraint.array.minLength)
              result[`${parent}-minLength`] = constraint.array.minLength;
            if (constraint.array.size)
              result[`${parent}-size`] = constraint.array.size;
          } else if (constraint.bigint) {
            const parent = 'bigint';
            if (constraint.bigint.max)
              result[`${parent}-max`] = constraint.bigint.max;
            if (constraint.bigint.min)
              result[`${parent}-min`] = constraint.bigint.min;
          } else if (constraint.date) {
            const parent = 'date';
            if (constraint.date.max)
              result[`${parent}-max`] = constraint.date.max;
            if (constraint.date.min)
              result[`${parent}-min`] = constraint.date.min;
            if (constraint.date.noInvalidDate)
              result[`${parent}-noInvalidDate`] = constraint.date.noInvalidDate;
          } else if (constraint.number) {
            const parent = 'number';
            if (constraint.number.isInteger)
              result[`${parent}-isInteger`] = constraint.number.isInteger;
            if (constraint.number.max)
              result[`${parent}-max`] = constraint.number.max;
            if (constraint.number.maxExcluded)
              result[`${parent}-maxExcluded`] = constraint.number.maxExcluded;
            if (constraint.number.min)
              result[`${parent}-min`] = constraint.number.min;
            if (constraint.number.minExcluded)
              result[`${parent}-minExcluded`] = constraint.number.minExcluded;
            if (constraint.number.noInteger)
              result[`${parent}-noInteger`] = constraint.number.noInteger;
            if (constraint.number.noDefaultInfinity)
              result[`${parent}-noDefaultInfinity`] =
                constraint.number.noDefaultInfinity;
            if (constraint.number.noNaN)
              result[`${parent}-noNaN`] = constraint.number.noNaN;
          } else if (constraint.string) {
            const parent = 'string';
            if (constraint.string.maxLength)
              result[`${parent}-maxLength`] = constraint.string.maxLength;
            if (constraint.string.minLength)
              result[`${parent}-minLength`] = constraint.string.minLength;
            if (constraint.string.patterns)
              result[`${parent}-patterns`] = constraint.string.patterns;
            if (constraint.string.size)
              result[`${parent}-size`] = constraint.string.size;
          }
        }
        Object.assign(result, check.annotations);
      }
    }
  }

  if (ast._tag == 'Union') {
    for (const tp of ast.types) {
      result = getMergedAnnotations(name, tp, result, logger);
    }
  }
  return result;
  //return Object.keys(result).length > 0 ? result : undefined;
}

export function buildFormMetaFromStructSchema<TFields extends Fields>(args: {
  schema: CrudSchemaType<TFields, boolean>;
  uiContext: 'view' | 'create' | 'update';
  logger?: Logger;
  ui?: UIAnnotations<TFields>;
}): FormFieldMeta[] {
  const fields = args.schema.ast.propertySignatures;
  return fields
    .map((f) => {
      const name = f.name.toString();
      const result: Record<string, any> = {};
      if (name == 'modifiedAt') {
        logger?.debug(f, 'digging AST');
      }
      const annotations = getMergedAnnotations(name, f.type, result, logger);

      const ui = args.ui?.[name as keyof TFields];
      const mergeUi = mergeUIAttributes(args.uiContext, ui);

      if (f.type._tag == 'Union') {
        const enums = f.type.types
          .filter((t) => t._tag == 'Literal')
          .map((v) => v.literal.toString());
        if (enums && enums.length > 0)
          validateEnumAttribute(enums, mergeUi, name);
      }
      return resolveUI(name, annotations, mergeUi);
    })
    .filter((v): v is FormFieldMeta => v != null);
}

function validateEnumAttribute(
  enumValues: readonly string[] | undefined,
  mergeUi: UIAnnotation | undefined,
  fieldName: string,
) {
  if (!mergeUi || mergeUi?.widget != 'select') return;
  if (!enumValues) {
    throw new Error(
      `[AutoForm] enum Attribute for "${fieldName} has conflict": schema: ${enumValues} , uiAttribute: ${mergeUi?.enumAttribute}`,
    );
  }
  const enumAttribute = mergeUi?.enumAttribute;
  if (!enumValues || !enumAttribute) {
    throw new Error(
      `[AutoForm] should not come here. Both Schema and UI Attribute should have value.`,
    );
  }
  const missing = enumValues.filter((v) => !(v in enumAttribute));

  if (missing.length > 0) {
    throw new Error(
      `[AutoForm] enumAttribute missing for field "${fieldName}": ${missing.join(', ')}`,
    );
  }
}
const mergeAnnotation = <T extends UIAnnotation>(
  base: T,
  override?: UIAnnotationOverride,
): T => {
  return {
    ...base,
    ...override,
  } as T;
};
const mergeUIAttributes = (
  context: 'view' | 'create' | 'update',
  uiDef?: UIAnnotationField,
): UIAnnotation | undefined => {
  if (!uiDef) return undefined;

  if ('default' in uiDef) {
    return mergeAnnotation(uiDef.default, uiDef[context]);
  }

  return uiDef as UIAnnotation;
};
function resolveUI(
  name: string,
  annotations: Record<string, any>,
  uiDef?: UIAnnotation,
): FormFieldMeta | undefined {
  if (!uiDef) {
    return {
      name,
      widget: 'hidden',
      label: name,
      placeholder: name,
      required: annotations['required'] ?? true,
      options: annotations ?? {},
    };
  }

  return {
    name,
    ...uiDef,
    label: uiDef.label ?? name,
    placeholder: uiDef.placeholder ?? name,
    required: annotations['required'] ?? true,
    options: annotations ?? {},
  };
}
// let result = getStructFields(TopicSchemas.updateSchema.ast.propertySignatures);
// logger?.debug(result);

// result = getStructFields(CategorySchemas.insertSchema.ast.propertySignatures);
// logger?.debug(JSON.stringify(result, null, 2));

// result = getStructFields(ItemSchemas.selectSchema.ast.propertySignatures);
// logger?.debug(JSON.stringify(result, null, 2));

// const result = buildFormMetaFromCrudSchema(
//   MarketHolidaySchema,
//   'select',
//   logger,
// );
// console.log(JSON.stringify(result, null, 2));
