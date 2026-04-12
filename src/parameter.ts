import { DBError } from './errors.js';
import { User } from './user.js';
import { Effect, Layer, Schedule, ServiceMap } from 'effect';
import { GyomuRepository } from './gyomu/gyomuRepository.js';
import { formatDateToYmd } from './dateOperation.js';

type ParameterType = string | number | boolean;

export class ParameterService extends ServiceMap.Service<
  ParameterService,
  {
    getValue: (
      key: string,
      user?: User | undefined,
      targetDate?: Date,
    ) => Effect.Effect<string, DBError, never>;
    booleanValue: (
      key: string,
      user?: User | undefined,
      targetDate?: Date,
    ) => Effect.Effect<boolean, DBError, never>;
    numberValue: (
      key: string,
      user?: User | undefined,
      targetDate?: Date,
    ) => Effect.Effect<number, DBError, never>;
    setValue: <T extends ParameterType>(
      key: string,
      value: T,
      user?: User | undefined,
    ) => Effect.Effect<boolean, DBError, never>;
    keyExists: (key: string) => Effect.Effect<boolean, DBError, never>;
  }
>()('ParameterService', {
  make: Effect.gen(function* () {
    const repo = yield* GyomuRepository;
    const loadParameter = (key: string) =>
      repo.parameterMaster.findByItemKey(key);
    const exists = (key: string) =>
      loadParameter(key).pipe(Effect.map((values) => values.length > 0));
    const getKey = (key: string, user?: User) =>
      user ? `${user.userId}_${key}` : key;
    const getValue = (key: string, user?: User, targetDate?: Date) =>
      Effect.gen(function* () {
        const itemKey = getKey(key, user);

        const itemValues = yield* loadParameter(itemKey).pipe(
          Effect.retry(Schedule.recurs(3)),
        );
        if (itemValues.length === 0) {
          return yield* Effect.fail(
            new DBError(`Can not retrieve parameter value for key: ${itemKey}`),
          );
        }
        if (itemValues.filter((v) => !v.itemFromDate?.trim()).length > 1) {
          return yield* Effect.fail(
            new DBError(
              `Multiple default values found for key: ${itemKey}. Please ensure there is only one default value without itemFromDate.`,
            ),
          );
        }
        if (!targetDate) {
          return itemValues[0].itemValue;
        }

        const targetYmd = formatDateToYmd(targetDate);

        let itemValue = '';

        const defaultRow = itemValues.find((v) => !v.itemFromDate?.trim());
        if (defaultRow) {
          itemValue = defaultRow.itemValue;
        }

        if (!defaultRow && targetDate) {
          return yield* Effect.fail(
            new DBError(
              `No default value found for key: ${itemKey} and target date: ${targetYmd}`,
            ),
          );
        }

        const sorted = [...itemValues].sort((a, b) =>
          a.itemFromDate > b.itemFromDate
            ? 1
            : a.itemFromDate < b.itemFromDate
              ? -1
              : 0,
        );

        for (const row of sorted) {
          if (!row.itemValue) continue;

          if (!row.itemFromDate?.trim()) {
            itemValue = row.itemValue;
          } else if (row.itemFromDate === targetYmd) {
            return row.itemValue;
          } else if (targetYmd > row.itemFromDate) {
            itemValue = row.itemValue;
          } else {
            break;
          }
        }

        return itemValue;
      });
    const setValue = <T extends ParameterType>(
      key: string,
      value: T,
      user?: User,
    ) =>
      Effect.gen(function* () {
        const itemKey = getKey(key, user);
        const itemValue = value.toString();

        const existsResult = yield* exists(itemKey);

        if (existsResult) {
          if (!itemValue) {
            // Delete
            yield* repo.parameterMaster.deleteByItemKey(itemKey);
            return true;
          }
          // Update
          yield* repo.parameterMaster.updateValueByItemKey(itemKey, itemValue);
          return true;
        }
        if (!itemValue) {
          // nothing to do
          return true;
        }
        // Insert
        yield* repo.parameterMaster.create([
          { itemKey, itemValue, itemFromDate: '' },
        ]);
        return true;
      });

    return {
      getValue,
      booleanValue: (key: string, user?: User, targetDate?: Date) =>
        getValue(key, user, targetDate).pipe(
          Effect.map((result) => result.toLowerCase() === 'true'),
        ),
      numberValue: (key: string, user?: User, targetDate?: Date) =>
        getValue(key, user, targetDate).pipe(Effect.map((result) => +result)),
      setValue,
      keyExists: (key: string) => exists(key),
    };
  }),
}) {
  static readonly live = Layer.effect(this, this.make);
}
// export class ParameterAccess {
//   static keyExists(key: string): GyomuResultAsync<boolean> {
//     return this.#loadParameter(key).map((values) => values.length > 0);
//   }

//   static #loadParameter(key: string): GyomuResultAsync<gyomu_param_master[]> {
//     return genericDBFunction<gyomu_param_master[]>(
//       'load gyomu_param_master',
//       async (key) =>
//         prisma.gyomu_param_master.findMany({
//           where: { item_key: key },
//         }),
//       [key],
//     );
//   }

//   static getKey(key: string, user?: User) {
//     if (user) return user.userId + '_' + key;
//     return key;
//   }

//   static value(
//     key: string,
//     user?: User,
//     targetDate?: Date,
//   ): GyomuResultAsync<string> {
//     const itemKey = this.getKey(key, user);

//     return withRetry(() => this.#loadParameter(itemKey), 3).andThen(
//       (itemValues) => {
//         if (!itemValues || itemValues.length === 0) {
//           return errAsync(new DBError('Unknown error on retrieving parameter'));
//         }

//         if (!targetDate) {
//           return okAsync(itemValues[0].item_value);
//         }

//         const targetDateYYYYMMDD = format(targetDate, 'yyyyMMdd');

//         let itemValue = '';

//         const defaultRow = itemValues.find((v) => !v.item_fromdate?.trim());
//         if (defaultRow) {
//           itemValue = defaultRow.item_value;
//         }

//         const sorted = [...itemValues].sort((a, b) =>
//           a.item_fromdate > b.item_fromdate
//             ? 1
//             : a.item_fromdate < b.item_fromdate
//               ? -1
//               : 0,
//         );

//         for (const row of sorted) {
//           if (!row.item_value) continue;

//           if (!row.item_fromdate?.trim()) {
//             itemValue = row.item_value;
//           } else if (row.item_fromdate === targetDateYYYYMMDD) {
//             return okAsync(row.item_value);
//           } else if (targetDateYYYYMMDD > row.item_fromdate) {
//             itemValue = row.item_value;
//           } else {
//             break;
//           }
//         }

//         return okAsync(itemValue);
//       },
//     );
//   }
//   static booleanValue(
//     key: string,
//     user?: User,
//     targetDate?: Date,
//   ): GyomuResultAsync<boolean> {
//     return ParameterAccess.value(key, user, targetDate).andThen((result) =>
//       okAsync(result.toLowerCase() == 'true'),
//     );
//   }

//   static numberValue(
//     key: string,
//     user?: User,
//     targetDate?: Date,
//   ): GyomuResultAsync<number> {
//     return ParameterAccess.value(key, user, targetDate).andThen((result) =>
//       okAsync(+result),
//     );
//   }

//   // static async stringListValue(
//   //   key: string,
//   //   user?: User,
//   //   targetDate?: Date
//   // ): PromiseResult<Array<string>, DBError> {
//   //   const result = await ParameterAccess.value(key, user, targetDate);
//   //   if (result.isFailure()) return result;
//   //   const resultString = result.value;
//   //   const stringList = JSON.parse(resultString) as string[];
//   //   return success(stringList);
//   // }

//   // static async listValue<T>(
//   //   key: string,
//   //   user?: User,
//   //   targetDate?: Date
//   // ): PromiseResult<Array<T>, DBError> {
//   //   const result = await ParameterAccess.value(key, user, targetDate);
//   //   if (result.isFailure()) return result;
//   //   const resultString = result.value;
//   //   const list = JSON.parse(resultString) as Array<T>;
//   //   return success(list);
//   // }

//   // static async stringDictionaryValue(
//   //   key: string,
//   //   user?: User,
//   //   targetDate?: Date
//   // ): PromiseResult<{ [key: string]: string }, DBError> {
//   //   const result = await ParameterAccess.value(key, user, targetDate);
//   //   if (result.isFailure()) return result;
//   //   const resultString = result.value;
//   //   const dictionary = JSON.parse(resultString) as { [key: string]: string };
//   //   return success(dictionary);
//   // }
//   // static async dictionaryValue<T>(
//   //   key: string,
//   //   user?: User,
//   //   targetDate?: Date
//   // ): PromiseResult<{ [key: string]: T }, DBError> {
//   //   const result = await ParameterAccess.value(key, user, targetDate);
//   //   if (result.isFailure()) return result;
//   //   const resultString = result.value;
//   //   const dictionary = JSON.parse(resultString) as { [key: string]: T };
//   //   return success(dictionary);
//   // }
//   // static async base64EncodedValue(key: string): PromiseResult<string, DBError> {
//   //   const result = await ParameterAccess.value(key);
//   //   if (result.isFailure()) return result;
//   //   const resultString = result.value;
//   //   return success(base64String2String(resultString));
//   // }

//   static setValue<T extends ParameterType>(
//     key: string,
//     item: T,
//     user?: User,
//   ): GyomuResultAsync<boolean> {
//     const itemKey = this.getKey(key, user);
//     const itemValue = item.toString();

//     return this.keyExists(itemKey).andThen((exists) =>
//       genericDBFunction<boolean>(
//         `setup gyomu_param_master for ${itemKey}`,
//         async (itemKey, itemValue) => {
//           if (exists) {
//             if (!itemValue) {
//               // Delete
//               return prisma.gyomu_param_master
//                 .delete({
//                   where: {
//                     item_key_item_fromdate: {
//                       item_key: itemKey,
//                       item_fromdate: '',
//                     },
//                   },
//                 })
//                 .then(() => true);
//             }

//             // Update
//             return prisma.gyomu_param_master
//               .update({
//                 where: {
//                   item_key_item_fromdate: {
//                     item_key: itemKey,
//                     item_fromdate: '',
//                   },
//                 },
//                 data: { item_value: itemValue },
//               })
//               .then(() => true);
//           }

//           if (!itemValue) {
//             // nothing to do
//             return true;
//           }

//           // Insert
//           return prisma.gyomu_param_master
//             .create({
//               data: {
//                 item_key: itemKey,
//                 item_fromdate: '',
//                 item_value: itemValue,
//               },
//             })
//             .then(() => true);
//         },
//         [itemKey, itemValue],
//       ),
//     );
//   }

//   // static async setStringListValue(
//   //   key: string,
//   //   item: Array<string>,
//   //   user?: User
//   // ) {
//   //   this.setValue(key, JSON.stringify(item), user);
//   // }
//   // static async setStringValueWithBase64Encode(
//   //   key: string,
//   //   item: string,
//   //   user?: User
//   // ) {
//   //   this.setValue(key, string2Base64String(item), user);
//   // }
// }
