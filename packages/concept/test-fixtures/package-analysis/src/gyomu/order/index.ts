export * from '../../schema.js'
export * from '../../schema.js'
/**
 * Creates an order identifier.
 */
export const createOrderId = (): string => crypto.randomUUID()
