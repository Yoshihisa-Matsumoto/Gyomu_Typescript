// export { z } from 'zod';
// import { z } from 'zod';
// export const desc = <T extends z.ZodTypeAny>(
//   schema: T,
//   description: string,
// ): T => {
//   return schema.describe(description) as T;
// };

// export type ZObjectReturn<
//   T extends core.$ZodLooseShape = Partial<Record<never, core.SomeType>>,
// > = ZodObject<util.Writeable<T>, core.$strip>;

// export const parsedEnv = (schema: ZObjectReturn): z.infer<typeof schema> => {
//   return schema.parse(process.env);
// };
