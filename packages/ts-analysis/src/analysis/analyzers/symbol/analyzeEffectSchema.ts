import { Node } from 'ts-morph'

import { SignatureId, isSupportedSchemaType } from '@gyomu/schema/typescript'
import { createMemberIdentityAndId } from '../../shared/createMemberIdentity.js'
import { analyzeDependency } from './analyzeDependency.js'
import type { MemberAnalysisResult } from '../types.js'
import type {
  MemberIdentityMemberPath,
  SupportedSchemaKind,
  SymbolId,
} from '@gyomu/schema/typescript'
import type {
  CallExpression,
  Expression,
  Identifier,
  ObjectLiteralElementLike,
  PropertyAccessExpression,
} from 'ts-morph'
import type {
  ImportAnalysis,
  SymbolIdentity,
  TypeAnalysis,
  TypeProperty,
} from '@gyomu/schema/schemas/typescript'

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
      if (expression.getText() == 'Schema') return { kind: 'Reference', expression: initializer }
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
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
): MemberAnalysisResult<TypeAnalysis> | undefined => {
  let propertyExpression: PropertyAccessExpression | undefined = undefined
  if (Node.isPropertyAccessExpression(callExpression)) propertyExpression = callExpression
  if (Node.isCallExpression(callExpression)) {
    const expression = callExpression.getExpression()
    if (Node.isPropertyAccessExpression(expression)) propertyExpression = expression
  }
  if (!propertyExpression) return undefined

  const type = propertyExpression.getName().toLowerCase()
  const dependency = analyzeDependency(
    propertyExpression.getExpression().getText(),
    imported,
    memberPath,
  )
  return {
    member: {
      source: 'effect-schema',
      text: name,
      structure: {
        kind: 'primitive',
        elementType: type,
      },
    },
    dependencies: [dependency],
  }
}
export const checkAndAnalyzeEffectSchema = (
  initializer: Expression | undefined,
  arg2: {
    name: string
    ownerSymbolId: SymbolId
    ownerSymbolIdentity: SymbolIdentity
    imported: Array<ImportAnalysis>
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
    ownerSymbolId: SymbolId
    ownerSymbolIdentity: SymbolIdentity
    imported: Array<ImportAnalysis>
    memberPath: MemberIdentityMemberPath
  },
): MemberAnalysisResult<TypeAnalysis> | undefined => {
  if (!arg1) return undefined
  if (arg1.kind == 'Primitive')
    return analyzeEffectSchemaPrimitive(
      arg2.name,
      arg1.kind,
      arg1.expression,
      arg2.imported,
      arg2.memberPath,
    )
  const dependency = analyzeDependency(arg1.expression.getText(), arg2.imported, arg2.memberPath)
  if (arg1.kind == 'Reference') {
    return {
      member: {
        source: 'effect-schema',
        text: arg2.name,
        structure: {
          kind: 'reference',
          targetId: arg1.expression.getText(),
        },
      },
      dependencies: [dependency],
    }
  }
  return analyzeEffectSchemaForNonPrimitive({
    name: arg2.name,
    supportType: arg1.kind,
    callExpression: arg1.expression as CallExpression,
    ownerSymbolId: arg2.ownerSymbolId,
    ownerSymbolIdentity: arg2.ownerSymbolIdentity,
    imported: arg2.imported,
    memberPath: arg2.memberPath,
  })
}

const analyzeEffectSchemaForNonPrimitive = (args: {
  name: string
  supportType: Exclude<SupportedSchemaKind, 'Primitive' | 'Reference'>
  callExpression: CallExpression
  ownerSymbolId: SymbolId
  ownerSymbolIdentity: SymbolIdentity
  imported: Array<ImportAnalysis>
  memberPath: MemberIdentityMemberPath
}): MemberAnalysisResult<TypeAnalysis> | undefined => {
  const { name, supportType, callExpression, ownerSymbolId, ownerSymbolIdentity, memberPath } = args
  const newMemberPath = name ? [...memberPath, name] : [...memberPath]
  const expressionArgs = callExpression.getArguments()
  switch (supportType) {
    case 'Literal': {
      const literalValue = expressionArgs[0]
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (literalValue == undefined) return undefined
      return {
        member: {
          text: literalValue.getText(),
          source: 'effect-schema',
          structure: {
            kind: 'literal',
            elementValue: literalValue.getText(),
          },
        },
        dependencies: [],
      }
    }
    case 'Struct': {
      if (expressionArgs.length == 0) {
        return {
          member: {
            text: callExpression.getText(),
            source: 'effect-schema',
            structure: {
              kind: 'object',
              members: [],
            },
          },
          dependencies: [],
        }
      }
      const targetStruct = expressionArgs[0]
      if (Node.isObjectLiteralExpression(targetStruct)) {
        const properties = targetStruct.getProperties()
        const membersResult = properties
          .map((p, index) =>
            ObjectLiteralElementLike2MemberAnalysis(
              p,
              index,
              ownerSymbolId,
              ownerSymbolIdentity,
              args.imported,
              newMemberPath,
            ),
          )
          .filter((m) => !!m)
        return {
          member: {
            text: callExpression.getText(),
            source: 'effect-schema',
            structure: {
              kind: 'object',
              members: membersResult.map((m) => m.member),
            },
          },
          dependencies: membersResult.map((m) => m.dependencies).flat(),
        }
      }
      break
    }
    case 'Union': {
      if (expressionArgs.length == 0) {
        return {
          member: {
            text: callExpression.getText(),
            source: 'effect-schema',
            structure: {
              kind: 'union',
              types: [],
            },
          },
          dependencies: [],
        }
      }
      const arrayLiteral = expressionArgs[0]
      if (Node.isArrayLiteralExpression(arrayLiteral)) {
        const elements = arrayLiteral.getElements()

        const typesResult = elements
          .map((e) => {
            const copiedArgs = { ...args }
            copiedArgs.name = e.getText()
            copiedArgs.memberPath = newMemberPath
            return checkAndAnalyzeEffectSchema(e, copiedArgs)
          })
          .filter((m) => !!m)
        const typesDependencies = typesResult.map((types) => types.dependencies).flat()

        return {
          member: {
            text: callExpression.getText(),
            source: 'effect-schema',
            structure: {
              kind: 'union',
              types: typesResult.map((t) => t.member),
            },
          },
          dependencies: typesDependencies,
        }
      }
      break
    }
    case 'Array': {
      if (expressionArgs.length == 0) {
        return {
          member: {
            text: callExpression.getText(),
            source: 'effect-schema',
          },
          dependencies: [],
        }
      }
      const targetStruct = expressionArgs[0]
      let memberType: MemberAnalysisResult<TypeAnalysis> | undefined = undefined
      if (Node.isExpression(targetStruct)) {
        memberType = checkAndAnalyzeEffectSchema(targetStruct, args)
      }
      if (!memberType) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        const targetContent = targetStruct?.getText() ?? ''
        const dependency = analyzeDependency(targetContent, args.imported, newMemberPath)
        memberType = {
          member: {
            source: 'effect-schema',
            text: targetContent,
            structure: {
              kind: 'reference',
              targetId: targetContent,
            },
          },
          dependencies: [dependency],
        }
      }
      return {
        member: {
          text: callExpression.getText(),
          source: 'effect-schema',
          structure: {
            kind: 'array',
            elementType: memberType.member,
          },
        },
        dependencies: memberType.dependencies,
      }
    }
  }
}

const ObjectLiteralElementLike2MemberAnalysis = (
  property: ObjectLiteralElementLike,
  index: number,
  ownerSymbolId: SymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
): MemberAnalysisResult<TypeProperty> | undefined => {
  if (Node.isPropertyAssignment(property)) {
    const newMemberPath = [...memberPath, property.getName()]
    const { id, identity } = createMemberIdentityAndId(
      {
        ownerSymbolId,
        memberPath: newMemberPath,
        signatureId: SignatureId('property'),
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

    const effectSchemaResult = effectSchemaSupport
      ? analyzeEffectSchema(effectSchemaSupport, {
          name: propertyName,
          memberPath: newMemberPath,
          ownerSymbolId,
          ownerSymbolIdentity,
          imported,
        })
      : undefined

    return {
      member: {
        documentable: false,
        name: propertyName,
        id,
        identity,
        readonly: false,
        rest: false,
        optional,
        declarationOrder: index,
        type: effectSchemaResult
          ? effectSchemaResult.member
          : ({
              source: 'effect-schema',
              text: property.getInitializer()?.getText() ?? '',
              structure: {
                kind: 'reference',
                targetId: property.getInitializer()?.getText() ?? '',
              },
            } satisfies TypeAnalysis),
      },
      dependencies: effectSchemaResult?.dependencies ?? [],
    }
  }

  return undefined
}
