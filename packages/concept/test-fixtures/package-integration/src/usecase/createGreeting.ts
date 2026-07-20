import type { GreetingSchema } from '../schema.js'

/**
 * Creates a greeting object.
 */
export const createGreeting = (name: string): GreetingSchema => ({
  message: `Hello ${name}`,
})
