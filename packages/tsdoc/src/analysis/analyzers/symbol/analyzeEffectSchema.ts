import { Node } from 'ts-morph'

import { withOptional } from '@gyomu/schema'
import { isSupportedSchemaType } from '@gyomu/schema/typescript'
import { createMemberIdentityAndId } from '../../shared/createMemberIdentity.js'
import type {
  MemberIdentityMemberPath,
  MemberIdentityOwnerSymbolId,
  NonDocumentablePropertyMemberAnalysis,
  SupportedSchemaKind,
  TypeAnalysis,
} from '@gyomu/schema/typescript'
import type {
  CallExpression,
  Expression,
  Identifier,
  ObjectLiteralElementLike,
  PropertyAccessExpression,
} from 'ts-morph'
import type { SymbolIdentity } from '@gyomu/schema/schemas/typescript/SymbolIdentity'

export const getSupportedEffectSchemaType = (
  initializer: Expression | undefined,
):
  | {
      kind: Exclude<SupportedSchemaKind, 'Reference'>
      expression: PropertyAccessExpression | CallExpression
    }
  | { kind: Extract<SupportedSchemaKind, 'Reference'>; expression: Identifier | CallExpression }
  | undefined => {
  if (!initializer) return undefined
  if (Node.isCallExpression(initializer)) {
    const expression = initializer.getExpression()
    if (Node.isPropertyAccessExpression(expression)) {
      if (expression.getExpression().getText() == 'Schema') {
        const targetSchemaType = expression.getNameNode().getText()

        if (isSupportedSchemaType(targetSchemaType)) {
          return { kind: targetSchemaType, expression: initializer }
        }

        switch (targetSchemaType) {
          case 'String':
          case 'Boolean':
          case 'Int':
            return { kind: 'Primitive', expression: initializer }
        }
      }
    }
    if (Node.isIdentifier(expression)) {
      return { kind: 'Reference', expression: initializer }
    }
  } else if (Node.isPropertyAccessExpression(initializer)) {
    if (initializer.getExpression().getText() == 'Schema') {
      const targetSchemaType = initializer.getNameNode().getText()

      switch (targetSchemaType) {
        case 'String':
        case 'Boolean':
        case 'Int':
          return { kind: 'Primitive', expression: initializer }
      }
    }
  } else if (Node.isIdentifier(initializer)) {
    return { kind: 'Reference', expression: initializer }
  }
  return undefined
}
const analyzeEffectSchemaPrimitive = (
  name: string,
  supportType: Extract<SupportedSchemaKind, 'Primitive'>,
  callExpression: CallExpression | PropertyAccessExpression,
): TypeAnalysis | undefined => {
  let propertyExpression: PropertyAccessExpression | undefined = undefined
  if (Node.isPropertyAccessExpression(callExpression)) propertyExpression = callExpression
  if (Node.isCallExpression(callExpression)) {
    const expression = callExpression.getExpression()
    if (Node.isPropertyAccessExpression(expression)) propertyExpression = expression
  }
  if (!propertyExpression) return undefined

  const type = propertyExpression.getName().toLowerCase()
  return {
    source: 'effect-schema',
    text: name,
    structure: {
      kind: 'primitive',
      elementType: type,
    },
  }
}
export const checkAndAnalyzeEffectSchema = (
  initializer: Expression | undefined,
  arg2: {
    name: string
    ownerSymbolId: MemberIdentityOwnerSymbolId
    ownerSymbolIdentity: SymbolIdentity
    memberPath: MemberIdentityMemberPath
  },
) => {
  const result = getSupportedEffectSchemaType(initializer)
  if (!result) return undefined
  return analyzeEffectSchema(result, arg2)
}
export const analyzeEffectSchema = (
  arg1:
    | {
        kind: Exclude<SupportedSchemaKind, 'Reference'>
        expression: PropertyAccessExpression | CallExpression
      }
    | { kind: Extract<SupportedSchemaKind, 'Reference'>; expression: Identifier | CallExpression }
    | undefined,
  arg2: {
    name: string
    ownerSymbolId: MemberIdentityOwnerSymbolId
    ownerSymbolIdentity: SymbolIdentity
    memberPath: MemberIdentityMemberPath
  },
): TypeAnalysis | undefined => {
  if (!arg1) return undefined
  if (arg1.kind == 'Primitive')
    return analyzeEffectSchemaPrimitive(arg2.name, arg1.kind, arg1.expression)
  if (arg1.kind == 'Reference') {
    return {
      source: 'effect-schema',
      text: arg2.name,
      structure: {
        kind: 'reference',
        targetId: arg1.expression.getText(),
      },
    }
  }
  return analyzeEffectSchemaForNonPrimitive({
    name: arg2.name,
    supportType: arg1.kind,
    callExpression: arg1.expression as CallExpression,
    ownerSymbolId: arg2.ownerSymbolId,
    ownerSymbolIdentity: arg2.ownerSymbolIdentity,
    memberPath: arg2.memberPath,
  })
}

const analyzeEffectSchemaForNonPrimitive = (args: {
  name: string
  supportType: Exclude<SupportedSchemaKind, 'Primitive' | 'Reference'>
  callExpression: CallExpression
  ownerSymbolId: MemberIdentityOwnerSymbolId
  ownerSymbolIdentity: SymbolIdentity
  memberPath: MemberIdentityMemberPath
}): TypeAnalysis | undefined => {
  const { name, supportType, callExpression, ownerSymbolId, ownerSymbolIdentity, memberPath } = args
  const newMemberPath = name ? [...memberPath, name] : [...memberPath]
  const expressionArgs = callExpression.getArguments()
  switch (supportType) {
    case 'Literal': {
      const literalValue = expressionArgs[0]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (literalValue == undefined) return undefined
      return {
        text: literalValue.getText(),
        source: 'effect-schema',
        structure: {
          kind: 'literal',
          elementValue: literalValue.getText(),
        },
      }
    }
    case 'Struct': {
      if (expressionArgs.length == 0) {
        return {
          text: callExpression.getText(),
          source: 'effect-schema',
          structure: {
            kind: 'object',
            members: [],
          },
        }
      }
      const targetStruct = expressionArgs[0]
      if (Node.isObjectLiteralExpression(targetStruct)) {
        const properties = targetStruct.getProperties()

        return {
          text: callExpression.getText(),
          source: 'effect-schema',
          structure: {
            kind: 'object',
            members: properties
              .map((p, index) =>
                ObjectLiteralElementLike2MemberAnalysis(
                  p,
                  index,
                  ownerSymbolId,
                  ownerSymbolIdentity,
                  newMemberPath,
                ),
              )
              .filter((m) => !!m),
          },
        }
      }
      break
    }
    case 'Union': {
      if (expressionArgs.length == 0) {
        return {
          text: callExpression.getText(),
          source: 'effect-schema',
          structure: {
            kind: 'union',
            types: [],
          },
        }
      }
      const arrayLiteral = expressionArgs[0]
      if (Node.isArrayLiteralExpression(arrayLiteral)) {
        const elements = arrayLiteral.getElements()

        return {
          text: callExpression.getText(),
          source: 'effect-schema',
          structure: {
            kind: 'union',
            types: elements
              .map((e) => {
                const copiedArgs = { ...args }
                copiedArgs.name = e.getText()
                return checkAndAnalyzeEffectSchema(e, copiedArgs)
              })
              .filter((m) => !!m),
          },
        }
      }
      break
    }
    case 'Array': {
      if (expressionArgs.length == 0) {
        return {
          text: callExpression.getText(),
          source: 'effect-schema',
        }
      }
      const targetStruct = expressionArgs[0]
      let memberType: TypeAnalysis | undefined = undefined
      if (Node.isExpression(targetStruct)) {
        memberType = checkAndAnalyzeEffectSchema(targetStruct, args)
      }
      if (!memberType) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const targetContent = targetStruct?.getText() ?? ''
        memberType = {
          source: 'effect-schema',
          text: targetContent,
          structure: {
            kind: 'reference',
            targetId: targetContent,
          },
        }
      }
      return {
        text: callExpression.getText(),
        source: 'effect-schema',
        structure: {
          kind: 'array',
          elementType: memberType,
        },
      }
    }
  }
}

const ObjectLiteralElementLike2MemberAnalysis = (
  property: ObjectLiteralElementLike,
  index: number,
  ownerSymbolId: MemberIdentityOwnerSymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  memberPath: MemberIdentityMemberPath,
): NonDocumentablePropertyMemberAnalysis | undefined => {
  if (Node.isPropertyAssignment(property)) {
    const newMemberPath = [...memberPath, property.getName()]
    const { id, identity } = createMemberIdentityAndId(
      {
        ownerSymbolId,
        memberPath: newMemberPath,
        signatureId: 'property',
      },
      ownerSymbolIdentity,
    )
    const initializer = property.getInitializer()
    let optional: boolean
    optional = false

    const effectSchemaSupport = getSupportedEffectSchemaType(initializer)

    if (Node.isPropertyAccessExpression(initializer)) {
      if (initializer.getNameNode().getText() == 'Optional') optional = true
    }
    const propertyName = property.getName()
    return {
      declarationOrder: index,
      kind: 'property',
      documentable: false,
      static: false,
      visibility: 'public',
      name: propertyName,
      id,
      identity,
      ownerSymbolId,
      readonly: false,
      rest: false,
      source: 'property-declaration',
      optional,
      ...withOptional({
        type: effectSchemaSupport
          ? analyzeEffectSchema(effectSchemaSupport, {
              name: propertyName,
              memberPath: newMemberPath,
              ownerSymbolId,
              ownerSymbolIdentity,
            })
          : ({
              source: 'effect-schema',
              text: property.getInitializer()?.getText() ?? '',
              structure: {
                kind: 'reference',
                targetId: property.getInitializer()?.getText() ?? '',
              },
            } satisfies TypeAnalysis),
      }),
    }
  }

  return undefined
}
