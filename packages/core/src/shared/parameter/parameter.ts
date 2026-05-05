import { DBError } from '../../errors.js';
import { Effect, Context } from 'effect';
import { User } from '../../schemas/user.js';
import { SchemaValidationError } from '@gyomu/shared';

type ParameterType = string | number | boolean;

export class ParameterService extends Context.Service<
  ParameterService,
  {
    getValue: (
      key: string,
      user?: User | undefined,
      targetDate?: Date,
    ) => Effect.Effect<string, DBError, never>;
    booleanValue: (
      key: string,
      user?: User | undefined,
      targetDate?: Date,
    ) => Effect.Effect<boolean, DBError, never>;
    numberValue: (
      key: string,
      user?: User | undefined,
      targetDate?: Date,
    ) => Effect.Effect<number, DBError, never>;
    setValue: <T extends ParameterType>(
      key: string,
      value: T,
      user?: User | undefined,
    ) => Effect.Effect<boolean, DBError | SchemaValidationError, never>;
    keyExists: (key: string) => Effect.Effect<boolean, DBError, never>;
  }
>()('ParameterService') {}
