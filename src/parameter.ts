import { gyomu_param_master, Prisma } from '@prisma/client';
import { format } from 'date-fns';
import prisma from './dbsingleton';
import { CriticalError, DBError } from './errors';
import { Failure, PromiseResult, fail, success } from './result';
import { User } from './user';
import { base64String2String, string2Base64String } from './base64';
import { genericDBFunction } from './dbutil';

type ParameterType = string | number | boolean;
export class ParameterAccess {
  static async keyExists(key: string): PromiseResult<boolean, DBError> {
    const values = await this.#loadParameter(key);
    if (values.isSuccess()) return success(values.value.length > 0);
    return values;
  }

  static async #loadParameter(
    key: string
  ): PromiseResult<gyomu_param_master[], DBError> {
    return await genericDBFunction<gyomu_param_master[]>(
      'load gyomu_param_master',
      async (key) => {
        //console.log('loading');
        const item_values = await prisma.gyomu_param_master.findMany({
          where: { item_key: key },
        });
        //console.log('loaded');
        return success(item_values);
      },
      [key]
    );
    // try {
    //   const item_values = await prisma.gyomu_param_master.findMany({
    //     where: { item_key: key },
    //   });
    //   return success(item_values);
    // } catch (err) {
    //   return new Failure(
    //     new DBError('Fail to load gyomu_param_master', err as Error)
    //   );
    // }
  }

  static getKey(key: string, user?: User) {
    if (!!user) return user.userId + '_' + key;
    return key;
  }

  static async value(
    key: string,
    user?: User,
    targetDate?: Date
  ): PromiseResult<string, DBError> {
    const itemKey = this.getKey(key, user);
    let itemValues: gyomu_param_master[] | undefined = undefined;
    let itemValue: string = '';
    let errorCount: number = 0;
    while (errorCount < 3) {
      const result = await this.#loadParameter(key);
      if (result.isSuccess()) {
        itemValues = result.value;
        break;
      }
      errorCount++;
      if (errorCount >= 3) {
        return result;
      }
    }
    if (!itemValues || itemValues.length === 0) {
      return fail('Unknown error on retrieving parameter', DBError);
    }
    if (!!targetDate) {
      const targetDateYYYYMMDD = format(targetDate, 'yyyyMMdd');
      const defaultRow = itemValues.find((v) => v.item_fromdate === '');
      if (!!defaultRow) {
        itemValue = defaultRow.item_value;
      }
      const sortedArray = itemValues.sort((a, b) => {
        return a.item_fromdate > b.item_fromdate
          ? 1
          : a.item_fromdate === b.item_fromdate
          ? 0
          : -1;
      });
      for (var row of sortedArray) {
        //console.log(row.item_fromdate, targetDateYYYYMMDD);
        if (!row.item_value) continue;
        if (!row.item_fromdate || !row.item_fromdate.trim())
          itemValue = row.item_value;
        else if (row.item_fromdate === targetDateYYYYMMDD) {
          itemValue = row.item_value;
          break;
        } else if (targetDateYYYYMMDD > row.item_fromdate)
          itemValue = row.item_value;
        else break;
      }
    } else {
      itemValue = itemValues[0].item_value;
    }
    return success(itemValue);
  }
  static async booleanValue(
    key: string,
    user?: User,
    targetDate?: Date
  ): PromiseResult<boolean, DBError> {
    const result = await ParameterAccess.value(key, user, targetDate);
    if (result.isFailure()) return result;
    const resultString = result.value;
    return success(resultString === 'true');
  }

  static async numberValue(
    key: string,
    user?: User,
    targetDate?: Date
  ): PromiseResult<number, DBError> {
    const result = await ParameterAccess.value(key, user, targetDate);
    if (result.isFailure()) return result;
    const resultString = result.value;
    return success(+resultString);
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

  static async setValue<T extends ParameterType>(
    key: string,
    item: T,
    user?: User
  ): PromiseResult<boolean, DBError> {
    const itemKey = this.getKey(key, user);
    const keyExistResult = await this.keyExists(itemKey);
    const itemValue = item.toString();
    if (keyExistResult.isFailure()) return keyExistResult;
    //console.log('Key Check Done');
    return await genericDBFunction<boolean>(
      `setup gyomu_param_master for ${itemKey}`,
      async (itemKey, itemValue) => {
        if (keyExistResult.value) {
          if (!itemValue) {
            //Delete Record
            await prisma.gyomu_param_master.delete({
              where: {
                item_key_item_fromdate: {
                  item_key: itemKey,
                  item_fromdate: '',
                },
              },
            });
          } else {
            //Update Record
            await prisma.gyomu_param_master.update({
              where: {
                item_key_item_fromdate: {
                  item_key: itemKey,
                  item_fromdate: '',
                },
              },
              data: { item_value: itemValue },
            });
          }
        } else {
          if (!!itemValue) {
            //Insert
            await prisma.gyomu_param_master.create({
              data: {
                item_key: itemKey,
                item_fromdate: '',
                item_value: itemValue,
              },
            });
          }
        }
        return success(true);
      },
      [itemKey, itemValue]
    );
    // try {
    //   if (keyExistResult.value) {
    //     if (!itemValue) {
    //       //Delete Record
    //       await prisma.gyomu_param_master.delete({
    //         where: {
    //           item_key_item_fromdate: { item_key: itemKey, item_fromdate: '' },
    //         },
    //       });
    //     } else {
    //       //Update Record
    //       await prisma.gyomu_param_master.update({
    //         where: {
    //           item_key_item_fromdate: { item_key: itemKey, item_fromdate: '' },
    //         },
    //         data: { item_value: itemValue },
    //       });
    //     }
    //   } else {
    //     if (!itemValue) {
    //       //Insert
    //       await prisma.gyomu_param_master.create({
    //         data: {
    //           item_key: itemKey,
    //           item_fromdate: '',
    //           item_value: itemValue,
    //         },
    //       });
    //     }
    //   }
    //   return success(true);
    // } catch (e) {
    //   if (
    //     e instanceof Prisma.PrismaClientKnownRequestError ||
    //     e instanceof Prisma.PrismaClientUnknownRequestError ||
    //     e instanceof Prisma.PrismaClientValidationError
    //   ) {
    //     return new Failure(
    //       new DBError('Fail to set data on gyomu_param_master', e)
    //     );
    //   } else if (e instanceof Prisma.PrismaClientRustPanicError) {
    //     throw new CriticalError(
    //       'Critical error on Prisma. Need to terminate the application',
    //       e
    //     );
    //   } else {
    //     return new Failure(
    //       new DBError(
    //         'Unknown failure to set data on gyomu_param_master',
    //         e as Error
    //       )
    //     );
    //   }
    //}
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
