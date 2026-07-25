import { schemaKindMap } from './types.js'
import { analyzeAnnotationChecks } from './analyzeAnnotationChecks.js'
import type { GuideNode, GuidePrimitiveNode, GuideProperty } from './types.js'
import type { AST } from 'effect/SchemaAST'
import type { Logger } from '../gyomu/logger/Logger.js'
import type { Schema } from 'effect'

export interface NormalizeSchemaOptions {
  maxDepth?: number
  logger?: Logger
}

export const normalizeSchema = (
  schema: Schema.Schema<any>,
  option?: NormalizeSchemaOptions,
): GuideNode => {
  return walkAST(schema.ast, {
    depth: 0,
    maxDepth: option?.maxDepth ?? 5,
    visited: new WeakSet<AST>(),
    logger: option?.logger,
  })
}

function walkAST(
  ast: AST,
  context: { depth: number; maxDepth: number; visited: WeakSet<AST>; logger?: Logger | undefined },
): GuideNode {
  // context.logger?.debug({ ast }, 'AST')
  // console.dir(ast, { depth: null })
  let optional: boolean | undefined
  let attributes: Record<string, any> = {}
  if (ast._tag == 'Null') {
    optional = true
  }
  if (ast.context?.isOptional) optional = true

  let description: string | undefined = undefined
  if (ast.annotations) {
    // logger?.debug(ast.annotations, 'Annotation exists');
    const desc = ast.annotations['description']
    if (typeof desc == 'string') description = desc
  }

  if (ast._tag == 'Objects') {
    if (!context.visited.has(ast)) context.visited.add(ast)
    else {
      return {
        kind: 'recursive',
        description,
        optional,
        attributes,
      }
    }
  }
  if (context.depth >= context.maxDepth) {
    return {
      kind: 'recursive',
      description,
      optional,
      attributes,
    }
  }

  const checks = ast.checks

  if (Array.isArray(checks)) {
    // logger?.debug(checks, 'checks exists');
    attributes = analyzeAnnotationChecks(ast._tag, checks, context.logger)
  }

  switch (ast._tag) {
    case 'Objects': {
      return {
        kind: 'object',
        attributes,
        description,
        optional,
        properties: ast.propertySignatures.map(
          (prop) =>
            ({
              name: prop.name.toString(),
              node: walkAST(prop.type, { ...context, depth: context.depth + 1 }),
            }) satisfies GuideProperty,
        ),
      }
    }

    case 'Arrays': {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const element = ast.elements[0] ?? ast.rest[0]!
      return {
        kind: 'array',
        attributes,
        elementType: walkAST(element, { ...context, depth: context.depth + 1 }),
        description,
        optional,
      }
    }
    case 'Union': {
      return {
        kind: 'union',
        attributes,
        description,
        optional,
        types: ast.types.map((tp) => walkAST(tp, { ...context, depth: context.depth + 1 })),
      }
    }
    case 'Enum': {
      return {
        kind: 'enum',
        attributes,
        description,
        optional,
        values: ast.enums,
      }
    }
    case 'Suspend': {
      return {
        ...walkAST(ast.thunk(), { ...context, depth: context.depth + 1 }),
        attributes,
        description,
        optional,
      }
    }
    case 'Any':
    case 'BigInt':
    case 'Boolean':
    case 'Never':
    case 'Null':
    case 'Number':
    case 'String':
    case 'Undefined':
    case 'Unknown':
    case 'Void': {
      return {
        kind: schemaKindMap[ast._tag],
        description,
        attributes,
        optional,
      } satisfies GuidePrimitiveNode
    }
    case 'Literal': {
      return {
        kind: 'literal',
        description,
        attributes,
        optional,
        value: ast.literal.valueOf(),
      }
    }
    default:
      throw new Error(`Unsupported AST: ${ast._tag}`)
  }
  // return Object.keys(result).length > 0 ? result : undefined;
}
