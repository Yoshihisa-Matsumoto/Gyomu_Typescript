import { Schema, SchemaTransformation } from 'effect'

export enum MessageRole {
  assistant = 'assistant',
  user = 'user',
  system = 'system',
}

// export type MessageRole = 'assistant' | 'user';

// export type Message = {
//   id: string;
//   role: MessageRole;
//   content: string;
// };

type JsonValue =
  | string
  | number
  | boolean
  | null
  | ReadonlyArray<JsonValue>
  | { readonly [key: string]: JsonValue }

export const JsonValueSchema: Schema.Schema<JsonValue> = Schema.suspend(() =>
  Schema.Union([
    Schema.String,
    Schema.Number,
    Schema.Boolean,
    Schema.Null,
    Schema.Array(JsonValueSchema),
    Schema.Record(Schema.String, JsonValueSchema),
  ]),
)

export const JsonObjectSchema = Schema.Record(Schema.String, JsonValueSchema)
export type JsonObject = Schema.Schema.Type<typeof JsonObjectSchema>

enum AttachmentType {
  image = 'image',
  audio = 'audio',
  file = 'file',
}
export const AttachmentSchema = Schema.Struct({
  id: Schema.String,
  type: Schema.Enum(AttachmentType),
  url: Schema.URL,
  mimeType: Schema.optional(Schema.String),
})

export type Attachment = Schema.Schema.Type<typeof AttachmentSchema>

export const SendMessageInputSchema = Schema.Struct({
  text: Schema.String,
  metadata: Schema.optional(JsonObjectSchema),
  attachments: Schema.optional(Schema.Array(AttachmentSchema)),
})
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

export const MessageSchema = Schema.Struct({
  id: Schema.String,
  role: Schema.Enum(MessageRole),
  content: Schema.String,
  createdAt: Schema.optional(IsoDateTime),
  metadata: Schema.optional(JsonObjectSchema),
})

export type Message = Schema.Schema.Type<typeof MessageSchema>
