import type { UserId } from '@gyomu/schema'

export interface ApprovalContext<TInput = unknown, TMetadata = unknown> {
  readonly action: string

  readonly actor: UserId

  readonly input: TInput

  readonly metadata: TMetadata
}
