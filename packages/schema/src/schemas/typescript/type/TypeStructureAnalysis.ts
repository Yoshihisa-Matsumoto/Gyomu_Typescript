import { Schema } from 'effect'
import { PrimitiveAnalysis } from './PrimitiveAnalysis.js'
import { LiteralAnalysis } from './LiteralAnalysis.js'
import { ObjectStructureAnalysis } from './ObjectStructureAnalysis.js'
import { ArrayStructureAnalysis } from './ArrayStructureAnalysis.js'
import { UnionStructureAnalysis } from './UnionStructureAnalysis.js'
import { TypeReferenceStructureAnalysis } from './TypeReferenceStructureAnalysis.js'
import { FunctionStructureAnalysis } from './FunctionStructureAnalysis.js'

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

export type TypeStructureAnalysis = typeof TypeStructureAnalysis.Type
