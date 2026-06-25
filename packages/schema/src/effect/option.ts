import { Option, Redacted, pipe } from 'effect'

/**
 * Unwraps a redacted password option into a raw string, or returns undefined if the option is None.
 *
 * @param password The optional redacted password to unwrap.
 *
 * @returns The raw string password, or undefined if the input is None.
 */
export const unwrapPassword = (
  password: Option.Option<Redacted.Redacted<string>>,
): string | undefined => pipe(password, Option.map(Redacted.value), Option.getOrUndefined)
