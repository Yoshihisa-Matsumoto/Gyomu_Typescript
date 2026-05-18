import { DBError } from '@gyomu/schema'
import { Effect, Layer, Schedule } from 'effect'
import { GyomuRepository } from '@gyomu/schema/gyomu'
import { formatDateToYmd } from '@gyomu/schema/entity'
import { ParameterService } from '@gyomu/schema/shared/parameter'
import type { User } from '@gyomu/schema/schemas/user'

type ParameterType = string | number | boolean

export const ParameterServiceLayer = Layer.effect(
  ParameterService,

  Effect.gen(function* () {
    const repo = yield* GyomuRepository
    const loadParameter = (key: string) => repo.parameterMaster.findByItemKey(key)
    const exists = (key: string) =>
      loadParameter(key).pipe(Effect.map((values) => values.length > 0))
    const getKey = (key: string, user?: User) => (user ? `${user.userId}_${key}` : key)
    const getValue = (key: string, user?: User, targetDate?: Date) =>
      Effect.gen(function* () {
        const itemKey = getKey(key, user)

        const itemValues = yield* loadParameter(itemKey).pipe(Effect.retry(Schedule.recurs(3)))
        const firstItem = itemValues[0]
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (itemValues.length === 0 || !firstItem) {
          return yield* Effect.fail(
            new DBError({
              message: `Can not retrieve parameter value for key`,
              params: { key, user, itemKey, itemValues },
              cause: undefined,
              operation: 'select' as const,
              table: 'parameterMaster',
            }),
          )
        }

        if (itemValues.filter((v) => !v.itemFromDate?.trim()).length > 1) {
          return yield* Effect.fail(
            new DBError({
              message: `Multiple default values found. Please ensure there is only one default value without itemFromDate.`,
              cause: undefined,
              params: itemKey,
              operation: 'select' as const,
              table: 'parameterMaster',
            }),
          )
        }

        if (!targetDate) {
          return firstItem.itemValue
        }

        const targetYmd = formatDateToYmd(targetDate)

        let itemValue = ''

        const defaultRow = itemValues.find((v) => !v.itemFromDate?.trim())
        if (defaultRow) {
          itemValue = defaultRow.itemValue
        }

        if (!defaultRow) {
          return yield* Effect.fail(
            new DBError({
              message: `No default value found`,
              params: { key: itemKey, targetDate: targetYmd },
              cause: undefined,
              operation: 'select',
              table: 'parameterMaster',
            }),
          )
        }

        // const sorted = [...itemValues].sort((a, b) =>
        //   a.itemFromDate > b.itemFromDate
        //     ? 1
        //     : a.itemFromDate < b.itemFromDate
        //       ? -1
        //       : 0,
        // );
        const sorted = [...itemValues].sort((a, b) => {
          if (a.itemFromDate == null && b.itemFromDate == null) return 0
          if (a.itemFromDate == null) return -1 // nullを後ろ
          if (b.itemFromDate == null) return 1

          return a.itemFromDate.localeCompare(b.itemFromDate)
        })

        for (const row of sorted) {
          if (!row.itemValue) continue

          if (!row.itemFromDate?.trim()) {
            itemValue = row.itemValue
          } else if (row.itemFromDate === targetYmd) {
            return row.itemValue
          } else if (targetYmd > row.itemFromDate) {
            itemValue = row.itemValue
          } else {
            break
          }
        }

        return itemValue
      })
    const setValue = <T extends ParameterType>(key: string, value: T, user?: User) =>
      Effect.gen(function* () {
        const itemKey = getKey(key, user)
        const itemValue = value.toString()

        const existsResult = yield* exists(itemKey)

        if (existsResult) {
          if (!itemValue) {
            // Delete
            yield* repo.parameterMaster.deleteByItemKey(itemKey)
            return true
          }
          // Update
          yield* repo.parameterMaster.updateValueByItemKey(itemKey, itemValue)
          return true
        }
        if (!itemValue) {
          // nothing to do
          return true
        }
        // Insert
        yield* repo.parameterMaster.create([{ itemKey, itemValue, itemFromDate: null }])
        return true
      })

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
    }
  }),
)
