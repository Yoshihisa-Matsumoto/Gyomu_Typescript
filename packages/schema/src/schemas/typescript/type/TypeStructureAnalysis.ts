import { Schema } from 'effect'
import { PrimitiveAnalysis } from './PrimitiveAnalysis.js'
import { LiteralAnalysis } from './LiteralAnalysis.js'
import { ObjectStructureAnalysis } from './ObjectStructureAnalysis.js'
import { ArrayStructureAnalysis } from './ArrayStructureAnalysis.js'
import { UnionStructureAnalysis } from './UnionStructureAnalysis.js'
import { TypeReferenceStructureAnalysis } from './TypeReferenceStructureAnalysis.js'
import { FunctionStructureAnalysis } from './FunctionStructureAnalysis.js'

/**
 * Defines a schema that encapsulates various TypeScript type structure analyses, including primitives, literals, objects, arrays, functions, unions, and type references.
 */
export const TypeStructureAnalysis = Schema.suspend(() =>
  Schema.Union([
    PrimitiveAnalysis,
    LiteralAnalysis,
    ObjectStructureAnalysis,
    ArrayStructureAnalysis,
    FunctionStructureAnalysis,
    ObjectStructureAnalysis,
    UnionStructureAnalysis,
    TypeReferenceStructureAnalysis,
  ]),
)

/**
 * Represents the inferred type for a TypeScript structure analysis.
 */
export type TypeStructureAnalysis = typeof TypeStructureAnalysis.Type
