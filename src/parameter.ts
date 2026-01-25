import { gyomu_param_master, Prisma } from './generated/prisma/client';
import { format } from 'date-fns';
import prisma from './dbsingleton';
import { CriticalError, DBError } from './errors';
//import { Failure, PromiseResult, fail, success } from './result';
import {Result, ResultAsync, errAsync, okAsync} from './result';
import { User } from './user';
import { base64String2String, string2Base64String } from './base64';
import { genericDBFunction } from './dbutil';

type ParameterType = string | number | boolean;

export const retryResultAsync =<T, E>(
  fn: () => ResultAsync<T, E>,
  maxRetry: number
): ResultAsync<T, E> =>{
  return fn().orElse(err =>
    maxRetry > 1 ? retryResultAsync(fn, maxRetry - 1) : errAsync(err)
  );
}
export class ParameterAccess {
  static keyExists(key: string): ResultAsync<boolean, DBError> {
    return this.#loadParameter(key)
      .map(values => values.length > 0);
  }

  static #loadParameter(
    key: string
  ): ResultAsync<gyomu_param_master[], DBError> {
    return genericDBFunction<gyomu_param_master[]>(
  'load gyomu_param_master',
  async (key) =>
    prisma.gyomu_param_master.findMany({
      where: { item_key: key },
    }),
  [key]
);
  }

  static getKey(key: string, user?: User) {
    if (!!user) return user.userId + '_' + key;
    return key;
  }

  static value(
    key: string,
    user?: User,
    targetDate?: Date
  ): ResultAsync<string, DBError> {

    const itemKey = this.getKey(key, user);

    return retryResultAsync(
      () => this.#loadParameter(itemKey),
      3
    )
    .andThen(itemValues => {
      if (!itemValues || itemValues.length === 0) {
        return errAsync(
          new DBError('Unknown error on retrieving parameter')
        );
      }

      if (!targetDate) {
        return okAsync(itemValues[0].item_value);
      }

      const targetDateYYYYMMDD = format(targetDate, 'yyyyMMdd');

      let itemValue = '';

      const defaultRow = itemValues.find(v => !v.item_fromdate?.trim());
      if (defaultRow) {
        itemValue = defaultRow.item_value;
      }

      const sorted = [...itemValues].sort((a, b) =>
        a.item_fromdate > b.item_fromdate ? 1 :
        a.item_fromdate < b.item_fromdate ? -1 : 0
      );

      for (const row of sorted) {
        if (!row.item_value) continue;

        if (!row.item_fromdate?.trim()) {
          itemValue = row.item_value;
        } else if (row.item_fromdate === targetDateYYYYMMDD) {
          return okAsync(row.item_value);
        } else if (targetDateYYYYMMDD > row.item_fromdate) {
          itemValue = row.item_value;
        } else {
          break;
        }
      }

      return okAsync(itemValue);
    });
  }
  static booleanValue(
    key: string,
    user?: User,
    targetDate?: Date
  ): ResultAsync<boolean, DBError> {
    return ParameterAccess.value(key, user, targetDate).andThen(result => okAsync(result.toLowerCase() == 'true')); 
  }

  static numberValue(
    key: string,
    user?: User,
    targetDate?: Date
  ): ResultAsync<number, DBError> {
    return ParameterAccess.value(key, user, targetDate).andThen(result => okAsync(+result));
  }

  // static async stringListValue(
  //   key: string,
  //   user?: User,
  //   targetDate?: Date
  // ): PromiseResult<Array<string>, DBError> {
  //   const result = await ParameterAccess.value(key, user, targetDate);
  //   if (result.isFailure()) return result;
  //   const resultString = result.value;
  //   const stringList = JSON.parse(resultString) as string[];
  //   return success(stringList);
  // }

  // static async listValue<T>(
  //   key: string,
  //   user?: User,
  //   targetDate?: Date
  // ): PromiseResult<Array<T>, DBError> {
  //   const result = await ParameterAccess.value(key, user, targetDate);
  //   if (result.isFailure()) return result;
  //   const resultString = result.value;
  //   const list = JSON.parse(resultString) as Array<T>;
  //   return success(list);
  // }

  // static async stringDictionaryValue(
  //   key: string,
  //   user?: User,
  //   targetDate?: Date
  // ): PromiseResult<{ [key: string]: string }, DBError> {
  //   const result = await ParameterAccess.value(key, user, targetDate);
  //   if (result.isFailure()) return result;
  //   const resultString = result.value;
  //   const dictionary = JSON.parse(resultString) as { [key: string]: string };
  //   return success(dictionary);
  // }
  // static async dictionaryValue<T>(
  //   key: string,
  //   user?: User,
  //   targetDate?: Date
  // ): PromiseResult<{ [key: string]: T }, DBError> {
  //   const result = await ParameterAccess.value(key, user, targetDate);
  //   if (result.isFailure()) return result;
  //   const resultString = result.value;
  //   const dictionary = JSON.parse(resultString) as { [key: string]: T };
  //   return success(dictionary);
  // }
  // static async base64EncodedValue(key: string): PromiseResult<string, DBError> {
  //   const result = await ParameterAccess.value(key);
  //   if (result.isFailure()) return result;
  //   const resultString = result.value;
  //   return success(base64String2String(resultString));
  // }

 static setValue<T extends ParameterType>(
  key: string,
  item: T,
  user?: User
): ResultAsync<boolean, DBError> {

  const itemKey = this.getKey(key, user);
  const itemValue = item.toString();

  return this.keyExists(itemKey).andThen(exists =>
    genericDBFunction<boolean>(
      `setup gyomu_param_master for ${itemKey}`,
      async (itemKey, itemValue) => {
        if (exists) {
          if (!itemValue) {
            // Delete
            return prisma.gyomu_param_master.delete({
              where: {
                item_key_item_fromdate: {
                  item_key: itemKey,
                  item_fromdate: '',
                },
              },
            }).then(() => true);
          }

          // Update
          const result = prisma.gyomu_param_master.update({
            where: {
              item_key_item_fromdate: {
                item_key: itemKey,
                item_fromdate: '',
              },
            },
            data: { item_value: itemValue },
          }).then(() => true);
        }

        if (!itemValue) {
          // nothing to do
          return true;
        }

        // Insert
        return prisma.gyomu_param_master.create({
          data: {
            item_key: itemKey,
            item_fromdate: '',
            item_value: itemValue,
          },
        }).then(() => true);
      },
      [itemKey, itemValue]
    )
  );
}


  // static async setStringListValue(
  //   key: string,
  //   item: Array<string>,
  //   user?: User
  // ) {
  //   this.setValue(key, JSON.stringify(item), user);
  // }
  // static async setStringValueWithBase64Encode(
  //   key: string,
  //   item: string,
  //   user?: User
  // ) {
  //   this.setValue(key, string2Base64String(item), user);
  // }
}
