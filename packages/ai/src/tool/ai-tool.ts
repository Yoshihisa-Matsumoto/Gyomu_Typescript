import type { ApprovalChallenge, ApprovalDecision, ApprovalRequestId } from '@gyomu/approval-core'
import type { JsonValue, PublicError, UserId } from '@gyomu/schema'
import type { EffectSchema } from '@gyomu/schema/entity'
import type { Config, Schema } from 'effect'

/**
 * Represents the outcome of a tool execution, either success with the resulting data or failure with a public error.
 */
export type ToolResult<T> =
  | {
      readonly success: true
      readonly data: T
    }
  | {
      readonly success: false
      readonly error: PublicError
    }

/**
 * Defines the structure of an AI tool, including its metadata, input validation schema, optional configuration, and execution logic.
 */
export interface AiTool<
  Input extends EffectSchema,
  Output extends JsonValue,
  ConfigSchema extends EffectSchema = never,
> {
  /**
   * The programmatic name of the tool.
   */
  readonly name: string

  /**
   * A human-readable description of the tool's purpose and functionality.
   */
  readonly description: string

  /**
   * The Effect schema defining the expected input structure for the tool.
   */
  readonly inputSchema: Input

  /**
   * Optional configuration schema and settings for the tool.
   */
  readonly config?: AiToolConfig<ConfigSchema>

  /**
   * Executes the tool logic with the provided validated input and configuration context.
   *
   * @returns A promise resolving to a ToolResult containing either the success data or an error.
   */
  readonly execute: (
    input: Schema.Schema.Type<Input>,
    context: AiToolContext<ConfigSchema>,
  ) => Promise<ToolResult<Output>>
}

/**
 * Represents an active tool execution task, tracking the execution ID, tool name, actor, and start time.
 */
export interface RunningTask {
  /**
   * The unique identifier for the specific execution of the tool.
   */
  readonly executionId: ExecutionId

  /**
   * The name of the tool currently being executed.
   */
  readonly toolName: string

  /**
   * The user or actor initiating the task execution.
   */
  readonly actor: UserId

  /**
   * The timestamp when the task execution commenced.
   */
  readonly startedAt: Date
}

/**
 * Defines the configuration parameters for an AI tool, including the raw configuration, the schema for final configuration, and the resolution mode.
 */
export type AiToolConfig<ConfigSchema extends EffectSchema> = {
  rawConfig: Config.Config<unknown>
  finalSchema: ConfigSchema
  scopeResolutionMode: 'static' | 'runtime' | 'mixed'
}

/**
 * Represents the execution context of an AI tool based on the provided configuration schema.
 */
export type AiToolContext<ConfigSchema extends EffectSchema> = Schema.Schema.Type<ConfigSchema>

/**
 * Contains comprehensive execution details for an AI tool, including config, execution ID, actor, and current environment.
 */
export type AiToolExecutionContext<ConfigSchema extends EffectSchema> = {
  readonly config: AiToolContext<ConfigSchema>
  readonly executionId: ExecutionId
  readonly actor: UserId
  readonly environment: 'dev' | 'staging' | 'prod'
}

/**
 * Defines a policy interface for evaluating whether a tool execution can proceed.
 */
export interface AiToolApprovalPolicy<TContext, TInput> {
  /**
   * Evaluates whether the tool execution with the provided input and context should be approved.
   *
   * @returns A promise resolving to the approval decision.
   */
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

/**
 * An alias for a unique tool execution identifier.
 */
export type ExecutionId = string

interface AiPendingToolExecution<ConfigSchema extends EffectSchema> {
  readonly executionId: ExecutionId
  readonly requestId: ApprovalRequestId
  readonly toolName: string

  readonly toolVersion?: string
  readonly payload: JsonValue // Tool 入力パラメータ
  readonly configSnapshot?: AiToolContext<ConfigSchema>
}
