import { Node } from 'ts-morph'

import { SignatureId, isSupportedSchemaType } from '@gyomu/schema/typescript'
import { createMemberIdentityAndId } from '../../shared/createMemberIdentity.js'
import { analyzeDependency } from './analyzeDependency.js'
import type { SchemaAnnotations } from '@gyomu/schema/schemas/typescript/type/SchemaAnnotations'
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
  DependencyCandidate,
  ImportAnalysis,
  SymbolIdentity,
  TypeAnalysis,
  TypeProperty,
} from '@gyomu/schema/schemas/typescript'
import type { Builder } from '@gyomu/schema/entity'

export const getSupportedEffectSchemaType = (
  initializer: Expression | undefined,
  parentAnnotations: SchemaAnnotations | undefined,
  parentDependencies: Array<DependencyCandidate>,
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
):
  | {
      kind: Exclude<SupportedSchemaKind, 'Reference'>
      expression: PropertyAccessExpression | CallExpression
      annotations: SchemaAnnotations | undefined
      dependencies: Array<DependencyCandidate>
    }
  | {
      kind: Extract<SupportedSchemaKind, 'Reference'>
      expression: Identifier | CallExpression
      annotations: SchemaAnnotations | undefined
      dependencies: Array<DependencyCandidate>
    }
  | undefined => {
  if (!initializer) return undefined
  let annotations: Builder<SchemaAnnotations> | undefined = undefined
  if (parentAnnotations) {
    annotations = {
      description: parentAnnotations.description,
      title: parentAnnotations.title,
      examples: parentAnnotations.examples ? [...parentAnnotations.examples] : undefined,
      identifier: parentAnnotations.identifier,
    }
  }
  const dependencies = [...parentDependencies]
  // console.log('getSupportedEffectSchemaType')
  if (Node.isCallExpression(initializer)) {
    {
      const callArguments = initializer.getArguments()
      if (callArguments.length > 0) {
        const argument = callArguments[0]
        if (Node.isCallExpression(argument)) {
          if (argument.getText().startsWith('Schema.fieldsAssign')) {
            const extendsCallExpressionArgs = argument.getArguments()
            const processAccess = extendsCallExpressionArgs[0]
            if (Node.isPropertyAccessExpression(processAccess)) {
              const identifier = processAccess.getExpression()
              if (Node.isIdentifier(identifier)) {
                dependencies.push(analyzeDependency(identifier.getText(), imported, memberPath))
              }
            }
          }
        }
      }
    }
    // console.log('callExpression')
    // const expression = getRootCallExpression(initializer)
    const propertyAccess = initializer.getExpression()
    if (Node.isPropertyAccessExpression(propertyAccess)) {
      console.log(`PropertyAccessExpression: ${propertyAccess.getName()}`)
      if (propertyAccess.getName() == 'annotate') {
        const annotationObject = initializer.getArguments()[0]
        if (Node.isObjectLiteralExpression(annotationObject)) {
          const properties = annotationObject.getProperties()
          properties.forEach((property) => {
            annotations = {}
            if (Node.isPropertyAssignment(property)) {
              const name = property.getName()
              const initializer2 = property.getInitializer()

              let stringContent = property.getInitializer()?.getText()
              if (Node.isStringLiteral(initializer2)) stringContent = initializer2.getLiteralValue()
              if (Node.isNoSubstitutionTemplateLiteral(initializer2))
                stringContent = initializer2.getLiteralText()
              if (stringContent) {
                switch (name) {
                  case 'description':
                    annotations.description = stringContent
                    break
                  case 'title':
                    annotations.title = stringContent
                    break
                  case 'identifier':
                    annotations.identifier = stringContent
                }
              }
            }
          })
        }
      }
      const childExpression = propertyAccess.getExpression()
      if (Node.isCallExpression(childExpression))
        return getSupportedEffectSchemaType(
          childExpression,
          annotations,
          dependencies,
          imported,
          memberPath,
        )
      // console.log(propertyAccess.getExpression().getText())

      if (propertyAccess.getExpression().getText() == 'Schema') {
        const targetSchemaType = propertyAccess.getNameNode().getText()
        console.log(targetSchemaType)
        console.log(annotations)
        if (isSupportedSchemaType(targetSchemaType)) {
          return { kind: targetSchemaType, expression: initializer, annotations, dependencies }
        }

        switch (targetSchemaType) {
          case 'String':
          case 'Boolean':
          case 'Int':
            return { kind: 'Primitive', expression: initializer, annotations, dependencies }
        }
      } else if (
        Node.isPropertyAccessExpression(childExpression) &&
        childExpression.getExpression().getText() == 'Schema'
      ) {
        const targetSchemaType = childExpression.getNameNode().getText()
        console.log(targetSchemaType)
        console.log(annotations)
        if (isSupportedSchemaType(targetSchemaType)) {
          return { kind: targetSchemaType, expression: initializer, annotations, dependencies }
        }

        switch (targetSchemaType) {
          case 'String':
          case 'Boolean':
          case 'Int':
            return { kind: 'Primitive', expression: initializer, annotations, dependencies }
        }
      }
    }
    if (Node.isIdentifier(propertyAccess)) {
      if (propertyAccess.getText() == 'Schema')
        return { kind: 'Reference', expression: initializer, annotations, dependencies }
    }
  } else if (Node.isPropertyAccessExpression(initializer)) {
    if (initializer.getExpression().getText() == 'Schema') {
      const targetSchemaType = initializer.getNameNode().getText()

      switch (targetSchemaType) {
        case 'String':
        case 'Boolean':
        case 'Int':
          return { kind: 'Primitive', expression: initializer, annotations, dependencies }
      }
    }
  } else if (Node.isIdentifier(initializer)) {
    return { kind: 'Reference', expression: initializer, annotations, dependencies }
  }
  return undefined
}

// const getRootCallExpression = (call: CallExpression): CallExpression => {
//   const expression = call.getExpression()
//   if (Node.isPropertyAccessExpression(expression)) {
//     const subExpression = expression.getExpression()
//     if (Node.isCallExpression(subExpression)) return getRootCallExpression(subExpression)
//     else return call
//   }
//   return call
// }
const analyzeEffectSchemaPrimitive = (
  name: string,
  supportType: Extract<SupportedSchemaKind, 'Primitive'>,
  callExpression: CallExpression | PropertyAccessExpression,
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
  annotations: SchemaAnnotations | undefined,
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
        annotations,
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
    dependencies: Array<DependencyCandidate>
  },
) => {
  const result = getSupportedEffectSchemaType(
    initializer,
    undefined,
    arg2.dependencies,
    arg2.imported,
    arg2.memberPath,
  )
  if (!result) return undefined
  return analyzeEffectSchema(result, arg2)
}
export const analyzeEffectSchema = (
  arg1:
    | {
        kind: Exclude<SupportedSchemaKind, 'Reference'>
        expression: PropertyAccessExpression | CallExpression
        annotations: SchemaAnnotations | undefined
      }
    | {
        kind: Extract<SupportedSchemaKind, 'Reference'>
        expression: Identifier | CallExpression
        annotations: SchemaAnnotations | undefined
      }
    | undefined,
  arg2: {
    name: string
    ownerSymbolId: SymbolId
    ownerSymbolIdentity: SymbolIdentity
    imported: Array<ImportAnalysis>
    memberPath: MemberIdentityMemberPath
    dependencies: Array<DependencyCandidate>
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
      arg1.annotations,
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
          annotations: arg1.annotations,
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
    annotations: arg1.annotations,
    dependencies: arg2.dependencies,
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
  annotations: SchemaAnnotations | undefined
  dependencies: Array<DependencyCandidate>
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
            annotations: args.annotations,
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
              annotations: args.annotations,
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
            ObjectLiteralElementLike2TypeProperty(
              p,
              index,
              ownerSymbolId,
              ownerSymbolIdentity,
              args.imported,
              newMemberPath,
              args.dependencies,
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
              annotations: args.annotations,
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
              annotations: args.annotations,
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

            copiedArgs.dependencies = args.dependencies
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
              annotations: args.annotations,
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
              annotations: args.annotations,
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
            annotations: args.annotations,
          },
        },
        dependencies: memberType.dependencies,
      }
    }
  }
}

const ObjectLiteralElementLike2TypeProperty = (
  property: ObjectLiteralElementLike,
  index: number,
  ownerSymbolId: SymbolId,
  ownerSymbolIdentity: SymbolIdentity,
  imported: Array<ImportAnalysis>,
  memberPath: MemberIdentityMemberPath,
  dependencies: Array<DependencyCandidate>,
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

    const effectSchemaSupport = getSupportedEffectSchemaType(
      initializer,
      undefined,
      dependencies,
      imported,
      newMemberPath,
    )

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
          dependencies,
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
