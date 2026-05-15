import { Schema } from 'effect'
import { MessageSchema } from './message.js'

enum MessageMode {
  normal = 'normal',
  study = 'study',
  quiz = 'quiz',
  counselling = 'counselling',
}

export const AiChatRequestSchema = Schema.Struct({
  message: Schema.String,
  history: Schema.Array(MessageSchema),
  mode: Schema.optional(Schema.Enum(MessageMode)),
})

export type AiChatRequest = Schema.Schema.Type<typeof AiChatRequestSchema>
