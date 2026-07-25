import type { Section } from '@gyomu/schema/schemas/document'
import type { ReadmeBuildContext, ReadmeSectionId } from '@gyomu/schema/concept'

import type { Effect } from 'effect'
import type { DocumentBuilderError } from '../../error/DocumentBuilderError.js'

export interface ReadmeSectionBuilder<R = never> {
  readonly id: ReadmeSectionId

  build: (context: ReadmeBuildContext) => Effect.Effect<Section, DocumentBuilderError, R>
  readonly enabled: (context: ReadmeBuildContext) => boolean
}
