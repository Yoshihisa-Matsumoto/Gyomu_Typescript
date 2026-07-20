import { withErrorTraits } from '@gyomu/schema'
import { Data } from 'effect'
import type { AppErrorContext } from '@gyomu/schema'

export interface AIErrorContext extends AppErrorContext {
  readonly variableName: string
}
export class TemplateVariableNotFoundError extends withErrorTraits(
  Data.TaggedError('@gyomu/cli/TemplateVariableNotFoundError')<AIErrorContext>,
  {
    isRetryable: () => false,
  },
) {}
