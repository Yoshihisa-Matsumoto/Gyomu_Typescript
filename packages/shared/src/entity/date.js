import { format } from 'date-fns';
import { Schema } from 'effect';
import { isPattern } from 'effect/Schema';
export const LocalDateSchema = Schema.String.pipe(Schema.check(isPattern(/^\d{4}-\d{2}-\d{2}$/)), Schema.brand('LocalDate'));
export const YearMonthSchema = Schema.String.pipe(Schema.check(isPattern(/^\d{4}-\d{2}$/)), Schema.brand('YearMonth'));
export const TargetDateSchema = Schema.TaggedUnion({
    daily: {
        type: Schema.Literal('daily'),
        date: LocalDateSchema,
    },
    monthly: {
        type: Schema.Literal('monthly'),
        month: YearMonthSchema,
    },
});
export const LocalDate = {
    make: (s) => Schema.decodeSync(LocalDateSchema)(s),
};
export const LocalDate2Date = (localDate) => {
    const [y, m, d] = localDate.split('-').map(Number);
    return new Date(y, m - 1, d);
};
export const Date2LocalDate = (date) => {
    return format(date, 'yyyy-MM-dd');
};
