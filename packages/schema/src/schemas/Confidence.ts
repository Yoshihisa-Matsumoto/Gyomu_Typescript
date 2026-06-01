import { Schema } from 'effect'

const between0and1 = Schema.check<Schema.Number>(Schema.makeFilter((n) => n >= 0 && n <= 1))
export const Confidence = Schema.Number.pipe(between0and1).annotate({
  description: 'AI decision confidence used for merge strategy routing',
})
