import type { GreetingSchema } from '../schema.js'

/**
 * Updates the greeting message.
 */
export const updateGreeting = (greeting: GreetingSchema, message: string): GreetingSchema => ({
  ...greeting,
  message,
})
