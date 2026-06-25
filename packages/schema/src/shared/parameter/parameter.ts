import { Context } from 'effect'
import type { Effect } from 'effect'
import type { User } from '../../schemas/user.js'
import type { DBError } from '../../error/DBError.js'
import type { SchemaValidationError } from '../../error/SchemaValidationError.js'

type ParameterType = string | number | boolean

/**
 * A service for retrieving and managing typed application parameters, supporting user-specific contexts and historical lookups.
 */
export class ParameterService extends Context.Service<
  ParameterService,
  {
    getValue: (
      key: string,
      user?: User | undefined,
      targetDate?: Date,
    ) => Effect.Effect<string, DBError, never>
    booleanValue: (
      key: string,
      user?: User | undefined,
      targetDate?: Date,
    ) => Effect.Effect<boolean, DBError, never>
    numberValue: (
      key: string,
      user?: User | undefined,
      targetDate?: Date,
    ) => Effect.Effect<number, DBError, never>
    setValue: <T extends ParameterType>(
      key: string,
      value: T,
      user?: User | undefined,
    ) => Effect.Effect<boolean, DBError | SchemaValidationError, never>
    keyExists: (key: string) => Effect.Effect<boolean, DBError, never>
  }
>()('ParameterService') {}
