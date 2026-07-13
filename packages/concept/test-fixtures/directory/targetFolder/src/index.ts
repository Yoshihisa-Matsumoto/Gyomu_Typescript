import { createGreeting } from './service/service.js'

/**
 * Creates a welcome message for a user.
 *
 * @param name User name.
 * @returns Welcome message.
 */
export const welcomeUser = (name: string): string => {
  return createGreeting(name)
}
