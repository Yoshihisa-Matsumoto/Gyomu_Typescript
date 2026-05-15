import { Schema } from 'effect'

export enum MessageRole {
  assistant = 'assistant',
  user = 'user',
}

// export type MessageRole = 'assistant' | 'user';

// export type Message = {
//   id: string;
//   role: MessageRole;
//   content: string;
// };

export const MessageSchema = Schema.Struct({
  id: Schema.String,
  role: Schema.Enum(MessageRole),
  content: Schema.String,
})

export type Message = Schema.Schema.Type<typeof MessageSchema>
