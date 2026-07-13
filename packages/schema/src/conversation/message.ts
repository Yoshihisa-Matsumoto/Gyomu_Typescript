import { Schema, SchemaTransformation } from 'effect'
import { JsonObjectSchema } from '../core/jsonValue.js'

/**
 * Defines the role of a message participant, such as assistant, user, or system.
 */
export enum MessageRole {
  /**
   * Represents the assistant role.
   */
  assistant = 'assistant',

  /**
   * Represents the user role.
   */
  user = 'user',

  /**
   * Represents the system role.
   */
  system = 'system',
}

// export type MessageRole = 'assistant' | 'user';

// export type Message = {
//   id: string;
//   role: MessageRole;
//   content: string;
// };

enum AttachmentType {
  image = 'image',
  audio = 'audio',
  file = 'file',
}

/**
 * Defines the schema for an attachment, including its ID, type, URL, and optional MIME type.
 */
export const AttachmentSchema = Schema.Struct({
  id: Schema.String,
  type: Schema.Enum(AttachmentType),
  url: Schema.URL,
  mimeType: Schema.optional(Schema.String),
})

/**
 * Represents a message attachment derived from the AttachmentSchema.
 */
export type Attachment = Schema.Schema.Type<typeof AttachmentSchema>

/**
 * Defines the schema for sending a message, requiring text and optional metadata or attachments.
 */
export const SendMessageInputSchema = Schema.Struct({
  text: Schema.String,
  metadata: Schema.optional(JsonObjectSchema),
  attachments: Schema.optional(Schema.Array(AttachmentSchema)),
})

/**
 * Represents the input structure for sending a message derived from the SendMessageInputSchema.
 */
export type SendMessageInput = Schema.Schema.Type<typeof SendMessageInputSchema>

const IsoDateTime = Schema.String.pipe(
  Schema.decodeTo(
    Schema.Date,
    SchemaTransformation.transform({
      decode: (str) => new Date(str),
      encode: (date) => date.toISOString(),
    }),
  ),
)

/**
 * Defines the schema for a message, including an ID, role, content, and optional creation timestamp and metadata.
 */
export const MessageSchema = Schema.Struct({
  id: Schema.String,
  role: Schema.Enum(MessageRole),
  content: Schema.String,
  createdAt: Schema.optional(IsoDateTime),
  metadata: Schema.optional(JsonObjectSchema),
})

/**
 * Represents a message entity derived from the MessageSchema.
 */
export type Message = Schema.Schema.Type<typeof MessageSchema>
