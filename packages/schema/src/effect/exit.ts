import { Cause, Exit } from 'effect'

export function getFailureFromExit<E>(exit: Exit.Exit<unknown, E>): E {
  if (!Exit.isFailure(exit)) {
    throw new Error('Expected failure')
  }

  const failure = Cause.findErrorOption(exit.cause)

  if (failure._tag !== 'Some') {
    throw new Error('Expected failure cause')
  }

  return failure.value
}
