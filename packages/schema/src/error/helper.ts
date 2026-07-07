import { Cause, Option } from 'effect'
import type { Exit } from 'effect/Exit'

/**
 * Extracts the error value from a provided Effect Exit object if it is a Failure.
 *
 * @param exit The Effect Exit to inspect.
 *
 * @returns The extracted error of type E.
 *
 * @throws Throws if the exit is not a Failure or if no error is found in the Cause.
 */
export function getFailureFromExit<E>(exit: Exit<any, E>): E {
  if (exit._tag !== 'Failure') {
    throw new Error('Expected Failure')
  }

  const opt = Cause.findErrorOption(exit.cause)

  if (Option.isNone(opt)) {
    throw new Error('No failure inside Cause')
  }

  return opt.value
}
