// /**
//  * Represents a detected modification made to documentation that was not automatically generated.
//  */
// export interface HumanEditSignal {
//   /**
//    * The category of the manual edit detected.
//    */
//   type:
//     | 'manual-format'
//     | 'custom-section'
//     | 'non-generated-tag'
//     | 'complex-markdown'
//     | 'custom-example'

//   /**
//    * A score representing the confidence or weight of the detected signal.
//    */
//   score: number

//   /**
//    * Contextual details providing further information about the edit.
//    */
//   details: {
//     // tagName?: string
//     /**
//      * A pattern identifier associated with the detected modification.
//      */
//     pattern?: string

//     /**
//      * The source identifier indicating where the edit originated.
//      */
//     source?: string

//     /**
//      * The section name where the human modification was applied.
//      */
//     targetSection: string
//   }
// }

// /**
//  * Contextual information about a specific location in documentation where human edits might occur.
//  */
// export interface HumanEditContext {
//   /**
//    * The JSDoc section or tag type being edited.
//    */
//   source: 'summary' | 'remarks' | 'example' | 'tag'

//   /**
//    * The specific tag name if the source is a tag.
//    */
//   tagName?: string
// }
