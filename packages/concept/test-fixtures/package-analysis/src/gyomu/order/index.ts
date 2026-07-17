/**
 * Creates an order identifier.
 */
export const createOrderId = (): string => crypto.randomUUID()
