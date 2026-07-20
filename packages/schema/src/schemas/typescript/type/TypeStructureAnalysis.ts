import { Schema } from 'effect'
import { PrimitiveAnalysis } from './structure/PrimitiveAnalysis.js'
import { LiteralAnalysis } from './structure/LiteralAnalysis.js'
import { ObjectStructureAnalysis } from './structure/ObjectStructureAnalysis.js'
import { ArrayStructureAnalysis } from './structure/ArrayStructureAnalysis.js'
import { UnionStructureAnalysis } from './structure/UnionStructureAnalysis.js'
import { TypeReferenceStructureAnalysis } from './structure/TypeReferenceStructureAnalysis.js'
import { FunctionStructureAnalysis } from './structure/FunctionStructureAnalysis.js'
import { GenericsStructureAnalysis } from './structure/GenericsStructureAnalysis.js'
import { IndexedAccessStructureAnalysis } from './structure/IndexedAccessStructureAnalysis.js'
import { MappedStructureAnalysis } from './structure/MappedTypeStructureAnalysis.js'
import { TypePredicateAnalysis } from './structure/TypePredicateAnalysis.js'
import { ConditionalStructureAnalysis } from './structure/ConditionalStructureTypeAnalysis.js'
import { InferStructureAnalysis } from './structure/InferStructureAnalysis.js'
import { TypeOperatorStructureAnalysis } from './structure/TypeOperatorStructureAnalysis.js'
import { ConstructorStructureAnalysis } from './structure/ConstructorStructureAnalysis.js'
import { ParenthesizedStructureAnalysis } from './structure/ParenthesizedStructureAnalysis.js'
import { TemplateLiteralStructureAnalysis } from './structure/TemplateLiteralStructureAnalysis.js'
import { TupleStructureAnalysis } from './structure/TupleStructureAnalysis.js'
import { ImportStructureAnalysis } from './structure/ImportStructureAnalysis.js'
import { ThisStructureAnalysis } from './structure/ThisStructureAnalysis.js'
import { OptionalStructureAnalysis } from './structure/OptionalStructureAnalysis.js'
import { RestStructureAnalysis } from './structure/RestStructureAnalysis.js'
import { NamedTupleMemberStructureAnalysis } from './structure/NamedTupleMemberStructureAnalysis.js'

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
    UnionStructureAnalysis,
    TypeReferenceStructureAnalysis,
    GenericsStructureAnalysis,
    IndexedAccessStructureAnalysis,
    MappedStructureAnalysis,
    TypePredicateAnalysis,
    ConditionalStructureAnalysis,
    InferStructureAnalysis,
    TypeOperatorStructureAnalysis,
    ConstructorStructureAnalysis,
    ParenthesizedStructureAnalysis,
    TemplateLiteralStructureAnalysis,
    TupleStructureAnalysis,
    ImportStructureAnalysis,
    ThisStructureAnalysis,
    OptionalStructureAnalysis,
    RestStructureAnalysis,
    NamedTupleMemberStructureAnalysis,
  ]),
)

/**
 * Represents the inferred type for a TypeScript structure analysis.
 */
export type TypeStructureAnalysis = typeof TypeStructureAnalysis.Type
