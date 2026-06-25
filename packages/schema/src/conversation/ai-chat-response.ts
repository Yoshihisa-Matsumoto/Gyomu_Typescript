import { createResultSchema } from '../core/result.js'
import { MessageSchema } from './message.js'
import type { Schema } from 'effect'

/**
 * Defines a schema for AI chat responses, wrapping a MessageSchema in a standard result structure.
 */
export const AiChatResponseSchema = createResultSchema(MessageSchema)

/**
 * Represents the inferred type of an AI chat response object.
 */
export type AiChatResponse = Schema.Schema.Type<typeof AiChatResponseSchema>
