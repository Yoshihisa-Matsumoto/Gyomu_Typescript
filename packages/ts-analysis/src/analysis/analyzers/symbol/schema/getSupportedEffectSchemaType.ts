import { Node } from 'ts-morph'

import { isSupportedSchemaType } from '@gyomu/schema/typescript'
import { analyzeDependency } from '../analyzeDependency.js'
import type { MemberIdentityMemberPath, SupportedSchemaKind } from '@gyomu/schema/typescript'
import type { CallExpression, Expression, Identifier, PropertyAccessExpression } from 'ts-morph'
import type {
  DependencyCandidate,
  ImportAnalysis,
  SchemaAnnotations,
} from '@gyomu/schema/schemas/typescript'
import type { Builder } from '@gyomu/schema/entity'

/**
 * Analyzes an initializer expression to determine if it represents a supported Effect schema type, extracting schema annotations, dependencies, and the underlying schema structure.
 *
 * @param initializer The expression to analyze.
 *
 * @param parentAnnotations Annotations accumulated from parent expressions.
 *
 * @param parentDependencies Dependencies collected from parent scopes.
 *
 * @param imported Information about imported symbols.
 *
 * @param memberPath The current path within the member hierarchy.
 *
 * @returns An object containing the schema kind, the relevant expression node, merged annotations, and discovered dependencies, or undefined if the initializer is not a supported schema.
 */
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
      // console.log(`PropertyAccessExpression: ${propertyAccess.getName()}`)
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
        // console.log(targetSchemaType)
        // console.log(annotations)
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
        // console.log(targetSchemaType)
        // console.log(annotations)
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
