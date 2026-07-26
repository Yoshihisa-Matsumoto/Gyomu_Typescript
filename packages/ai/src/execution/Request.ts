import type { AiExecutionContext } from './AiExecutionContext.js'

/**
 * Represents a unified AI request object combining selection criteria, execution context, and the request body.
 *
 * @param TSelection The selection criteria type.
 *
 * @param TBody The request body type.
 */
export type Request<TSelection, TBody> = TSelection & AiExecutionContext & TBody
