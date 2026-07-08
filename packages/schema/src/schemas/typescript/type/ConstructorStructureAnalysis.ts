import { Schema } from 'effect'
import { StructureBase } from './StructureBase.js'
import { TypeAnalysis } from './TypeAnalysis.js'
import { TypeProperty } from './TypeProperty.js'

/**
 * Represents a constructor function type.
 *
 * @example
 * ```ts
 * new () => Foo
 * ```
 *
 * @example
 * ```ts
 * new (name: string, age: number) => Person
 * ```
 *
 * @example
 * ```ts
 * abstract new (...args: any[]) => T
 * ```
 *
 * Corresponds to TypeScript's `ConstructorTypeNode`.
 */
export interface ConstructorStructureAnalysis extends StructureBase {
  readonly kind: 'constructor'

  /**
   * Parameters accepted by the constructor.
   */
  readonly parameters: ReadonlyArray<TypeProperty>

  /**
   * Instance type created by the constructor.
   */
  readonly returnType?: TypeAnalysis | undefined

  // /**
  //  * Type parameters declared by the constructor.
  //  */
  // readonly generics: GenericsStructureAnalysis

  /**
   * Whether the constructor is declared with the `abstract` modifier.
   */
  readonly abstract: boolean
}

export const ConstructorStructureAnalysis = Schema.Struct({
  kind: Schema.Literal('constructor'),

  parameters: Schema.Array(Schema.suspend(() => TypeProperty)).annotate({
    description: 'Parameters accepted by the constructor.',
  }),

  returnType: Schema.optional(Schema.suspend(() => TypeAnalysis)).annotate({
    description: 'Instance type created by the constructor.',
  }),

  // generics: GenericsStructureAnalysis.annotate({
  //   description: 'Type parameters declared by the constructor.',
  // }),

  abstract: Schema.Boolean.annotate({
    description: 'Whether the constructor is declared with the abstract modifier.',
  }),
}).pipe(
  Schema.fieldsAssign(StructureBase.fields),
  Schema.annotate({
    identifier: 'ConstructorStructureAnalysis',
    title: 'ConstructorStructureAnalysis',
    description: 'Represents a constructor function type.',
  }),
)
