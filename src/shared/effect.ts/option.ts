import { pipe } from 'effect';
import { Option } from 'effect';
import { Redacted } from 'effect';

export const unwrapPassword = (
  password: Option.Option<Redacted.Redacted<string>>,
): string | undefined =>
  pipe(password, Option.map(Redacted.value), Option.getOrUndefined);
