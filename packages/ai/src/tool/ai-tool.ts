import type { ApprovalChallenge, ApprovalDecision, ApprovalRequestId } from '@gyomu/approval-core'
import type { JsonValue, PublicError, UserId } from '@gyomu/schema'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { Config, Schema } from 'effect'

export type ToolResult<T> =
  | {
      readonly success: true
      readonly data: T
    }
  | {
      readonly success: false
      readonly error: PublicError
    }

export interface AiTool<
  ConfigSchema extends EffectSchema,
  Input extends EffectSchema,
  Output extends JsonValue,
> {
  readonly name: string

  readonly description: string

  readonly inputSchema: Input

  readonly execute: (
    context: AiToolContext<ConfigSchema>,
    input: Schema.Schema.Type<Input>,
  ) => Promise<ToolResult<Output>>
}

export interface RunningTask {
  readonly executionId: ExecutionId

  readonly toolName: string

  readonly actor: UserId

  readonly startedAt: Date
}

export type AiToolConfig<ConfigSchema extends EffectSchema> = {
  rawConfig: Config.Config<unknown>
  finalSchema: ConfigSchema
  scopeResolutionMode: 'static' | 'runtime' | 'mixed'
}
export type AiToolContext<ConfigSchema extends EffectSchema> = Schema.Schema.Type<ConfigSchema>

export type AiToolExecutionContext<ConfigSchema extends EffectSchema> = {
  readonly config: AiToolContext<ConfigSchema>
  readonly executionId: ExecutionId
  readonly actor: UserId
  readonly environment: 'dev' | 'staging' | 'prod'
}

export interface AiToolApprovalPolicy<TContext, TInput> {
  evaluate: (ctx: {
    toolName: string
    input: TInput
    context: TContext
  }) => Promise<ApprovalDecision>
}

type AiToolExecutionResult<TResult> =
  | {
      type: 'completed'
      result: ToolResult<TResult>
    }
  | {
      type: 'awaiting-approval'

      approvalRequestId: string

      challenge: ApprovalChallenge
    }

export type ExecutionId = string

interface AiPendingToolExecution<ConfigSchema extends EffectSchema> {
  readonly executionId: ExecutionId
  readonly requestId: ApprovalRequestId
  readonly toolName: string

  readonly toolVersion?: string
  readonly payload: JsonValue // Tool 入力パラメータ
  readonly configSnapshot?: AiToolContext<ConfigSchema>
}
