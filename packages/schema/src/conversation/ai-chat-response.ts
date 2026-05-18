import { createResultSchema } from '../core/result.js'
import { MessageSchema } from './message.js'
import type { Schema } from 'effect'

export const AiChatResponseSchema = createResultSchema(MessageSchema)

export type AiChatResponse = Schema.Schema.Type<typeof AiChatResponseSchema>
