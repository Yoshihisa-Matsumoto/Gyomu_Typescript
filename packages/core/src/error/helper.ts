import { Cause, Option } from 'effect';
import { Exit } from 'effect/Exit';

export function getFailureFromExit<E>(exit: Exit<any, E>): E {
  if (exit._tag !== 'Failure') {
    throw new Error('Expected Failure');
  }

  const opt = Cause.findErrorOption(exit.cause);

  if (Option.isNone(opt)) {
    throw new Error('No failure inside Cause');
  }

  return opt.value;
}
