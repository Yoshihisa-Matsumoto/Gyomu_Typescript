import { Schema } from 'effect'

import { JsDocParam, JsDocReturns, JsDocThrows, ParsedTag } from './JsDocParam.js'
import { ProtectedRegion } from './ProtectedRegion.js'
import { HumanEditSignal } from './HumanEditSignal.js'
import { RawJsDoc } from './RawJsDoc.js'
import { ProtectedSection } from './ProtectedSection.js'
import { GeneratorMarker } from './GeneratorMarker.js'

/**
 * Represents the structural components and metadata extracted from a parsed JSDoc comment block.
 */
export const ParsedJsDoc = Schema.Struct({
  summary: Schema.optional(
    Schema.String.annotate({
      description: 'The brief summary description of the documented symbol.',
    }),
  ),

  remarks: Schema.optional(
    Schema.String.annotate({
      description: 'Extended remarks or detailed description of the documented symbol.',
    }),
  ),

  examples: Schema.Array(Schema.String).annotate({
    description: 'A collection of code examples associated with the symbol.',
  }),

  params: Schema.Array(JsDocParam).annotate({
    description: 'An array of parameter definitions extracted from the JSDoc.',
  }),

  returns: Schema.optional(
    JsDocReturns.annotate({
      description: 'Metadata describing the return value of the function.',
    }),
  ),

  throws: Schema.Array(JsDocThrows).annotate({
    description: 'An array of exception or error conditions defined in the JSDoc.',
  }),

  templates: Schema.Array(Schema.String).annotate({
    description: 'A collection of generic type template names.',
  }),

  deprecated: Schema.optional(
    Schema.String.annotate({
      description: 'Optional deprecation notice providing reasoning or replacement details.',
    }),
  ),

  tags: Schema.Array(ParsedTag).annotate({
    description: 'A collection of custom or standard JSDoc tags found in the comment.',
  }),

  protectedSections: Schema.Array(ProtectedSection).annotate({
    description:
      'Segments of the original JSDoc block that are marked as protected from automatic modification.',
  }),

  protectedRegions: Schema.Array(ProtectedRegion).annotate({
    description: 'Defined regions within the JSDoc that must not be altered during re-generation.',
  }),

  generator: Schema.optional(
    GeneratorMarker.annotate({
      description: 'Optional marker indicating the tool or generator that created the JSDoc.',
    }),
  ),

  humanEditSignals: Schema.Array(HumanEditSignal).annotate({
    description:
      'Collection of signals detected that indicate manual modifications were performed on the JSDoc.',
  }),

  raw: RawJsDoc.annotate({
    description: 'The unparsed, raw representation of the JSDoc source content.',
  }),

  startOffset: Schema.Number.annotate({
    description:
      'The character offset indicating where the JSDoc comment begins in the source file.',
  }),

  endOffset: Schema.Number.annotate({
    description: 'The character offset indicating where the JSDoc comment ends in the source file.',
  }),
}).annotate({
  description:
    'Represents the structural components and metadata extracted from a parsed JSDoc comment block.',
})

/**
 * The inferred TypeScript type for a parsed JSDoc comment block.
 */
export type ParsedJsDoc = Schema.Schema.Type<typeof ParsedJsDoc>
