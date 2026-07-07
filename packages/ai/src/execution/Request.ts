import type { AiExecutionContext } from './AiExecutionContext.js'

export type Request<TSelection, TBody> = TSelection & AiExecutionContext & TBody
