import { Schema } from 'effect';
export declare const LocalDateSchema: Schema.brand<Schema.String, "LocalDate">;
export declare const YearMonthSchema: Schema.brand<Schema.String, "YearMonth">;
export declare const TargetDateSchema: Schema.TaggedUnion<{
    readonly daily: Schema.TaggedStruct<"daily", {
        readonly type: Schema.Literal<"daily">;
        readonly date: Schema.brand<Schema.String, "LocalDate">;
    }>;
    readonly monthly: Schema.TaggedStruct<"monthly", {
        readonly type: Schema.Literal<"monthly">;
        readonly month: Schema.brand<Schema.String, "YearMonth">;
    }>;
}>;
export type LocalDate = string & Schema.Schema<typeof LocalDateSchema>;
export type YearMonth = string & Schema.Schema<typeof YearMonthSchema>;
export type TargetDate = Schema.Schema<typeof TargetDateSchema>;
export declare const LocalDate: {
    make: (s: string) => string & import("effect/Brand").Brand<"LocalDate">;
};
export declare const LocalDate2Date: (localDate: LocalDate) => Date;
export declare const Date2LocalDate: (date: Date) => LocalDate;
