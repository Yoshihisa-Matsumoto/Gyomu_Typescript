import { Node } from 'ts-morph'

import { SignatureId } from '@gyomu/schema/typescript'
import { createMemberIdentityAndId } from '../../../shared/createMemberIdentity.js'
import { analyzeDependency } from '../analyzeDependency.js'
import { getSupportedEffectSchemaType } from './getSupportedEffectSchemaType.js'
import { analyzeEffectSchema, checkAndAnalyzeEffectSchema } from './analyzeEffectSchema.js'
import type { SchemaAnnotations } from '@gyomu/schema/schemas/typescript/type/SchemaAnnotations'
import type { MemberAnalysisResult } from '../../types.js'
import type {
  MemberIdentityMemberPath,
  SupportedSchemaKind,
  SymbolId,
} from '@gyomu/schema/typescript'
import type { CallExpression, ObjectLiteralElementLike } from 'ts-morph'
import type {
  DependencyCandidate,
  ImportAnalysis,
  SymbolIdentity,
  TypeAnalysis,
  TypeProperty,
} from '@gyomu/schema/schemas/typescript'

export const analyzeEffectSchemaForNonPrimitive = (args: {
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
              properties: [],
              indexSignatures: [],
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
              properties: membersResult.map((m) => m.member),
              indexSignatures: [],
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
              typeParameters: [],
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
                typeParameters: [],
              },
            } satisfies TypeAnalysis),
      },
      dependencies: effectSchemaResult?.dependencies ?? [],
    }
  }

  return undefined
}
