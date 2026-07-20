// import { Cause, Exit } from 'effect'

// /**
//  * Extracts the error value from a failed Effect Exit, throwing if the exit is not a failure or does not contain a specific error.
//  *
//  * @param exit The Effect Exit to inspect.
//  *
//  * @returns The contained error value of type E.
//  *
//  * @throws {Error} Throws if the exit is not a failure or the cause does not contain a recoverable error.
//  */
// export function getFailureFromExit<E>(exit: Exit.Exit<unknown, E>): E {
//   if (!Exit.isFailure(exit)) {
//     throw new Error('Expected failure')
//   }

//   const failure = Cause.findErrorOption(exit.cause)

//   if (failure._tag !== 'Some') {
//     const die = Cause.findDie(exit.cause)

//     if (die._tag == 'Success') throw new Error('Expected Failure')
//     const failure2 = Cause.findErrorOption(die.failure)
//     if (failure2._tag !== 'Some') {
//       throw new Error('Expected failure')
//     }
//     return failure2.value
//   }

//   return failure.value
// }
