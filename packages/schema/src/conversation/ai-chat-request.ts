import { Schema } from 'effect'
import { MessageSchema } from './message.js'

// enum MessageMode {
//   normal = 'normal',
//   study = 'study',
//   quiz = 'quiz',
//   counselling = 'counselling',
// }

/**
 * Defines the schema for an AI chat request, containing the current message, a history of messages, and an optional mode string.
 */
export const AiChatRequestSchema = Schema.Struct({
  message: Schema.String,
  history: Schema.Array(MessageSchema),
  mode: Schema.optional(Schema.String),
})

/**
 * The inferred type for an AI chat request based on the AiChatRequestSchema.
 */
export type AiChatRequest = Schema.Schema.Type<typeof AiChatRequestSchema>
