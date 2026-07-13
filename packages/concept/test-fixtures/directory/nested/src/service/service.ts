import { normalizeName } from './helper.js'

/**
 * Creates a greeting message for a user.
 *
 * @param name User name.
 * @returns Greeting message.
 */
export const createGreeting = (name: string): string => {
  return `Hello, ${normalizeName(name)}!`
}
