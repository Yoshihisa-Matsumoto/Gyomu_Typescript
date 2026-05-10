import { format } from 'date-fns'
import { Effect, Layer } from 'effect'
import { GyomuRepository } from '@gyomu/core/gyomu'
import {
  LocalDate,
  LocalDateSchema,
  YearMonthSchema,
  convertToSchemaObjectWithEffect,
} from '@gyomu/core/entity'
import { MilestoneService } from '@gyomu/core/gyomu/task'
import { polling } from '@gyomu/core/effect'
import { DBError } from '@gyomu/core'
import type { MilestoneExistResultType } from '@gyomu/core/gyomu/task'
import type { MilestoneDailyDomainSchema, YearMonth } from '@gyomu/core/entity'
import type { SchemaValidationError, TimeoutError } from '@gyomu/core'
import type { MilestoneDailySchema, MilestoneSchema } from '@gyomu/core/schemas/gyomu'
import type { Schema } from 'effect'

export const MilestoneServiceLayer = Layer.effect(
  MilestoneService,
  Effect.gen(function* () {
    const repo = yield* GyomuRepository
    const existFunc = (
      milestoneId: string,
      targetYmd: LocalDate,
      isMonthly = false,
    ): Effect.Effect<
      MilestoneExistResultType,
      DBError | SchemaValidationError,
      GyomuRepository
    > => {
      // const targetDateYmd = convertTargetDate(targetYmd, isMonthly);
      return repo.milestoneDaily
        .findByMilestoneIdAndTargetDate(milestoneId, targetYmd, isMonthly)
        .pipe(
          Effect.map((records) => {
            if (records.length > 0) {
              return {
                exists: true,
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                updateTime: records[0]!.modifiedAt,
              }
            }
            return { exists: false }
          }),
        )
    }
    return {
      exists: existFunc,
      register: (
        milestoneId: string,
        targetYmd: LocalDate,
        isMonthly = false,
      ): Effect.Effect<string, DBError | SchemaValidationError, GyomuRepository> => {
        // const targetYmdForRecord = convertTargetDate(targetYmd, isMonthly);

        return Effect.gen(function* () {
          const existsResult = yield* existFunc(milestoneId, targetYmd, isMonthly)
          if (existsResult.exists) {
            return existsResult.updateTime
          }
          const result = yield* repo.milestoneDaily.create([
            {
              milestoneId,
              targetType: isMonthly ? 'monthly' : 'daily',
              targetDate: LocalDate.make(targetYmd),
              targetYm: targetYmd.substring(0, 7),
            },
          ])
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          return result[0]!.modifiedAt
        })
      },
      wait: (
        milestoneId: string,
        targetYmd: LocalDate,
        timeoutSecond: number,
      ): Effect.Effect<boolean, TimeoutError, GyomuRepository> => {
        const interval = timeoutSecond < 60 ? 1 : 5

        return polling(
          `Wait for milestone ${milestoneId} on ${format(targetYmd, 'yyyyMMdd')} to be on`,
          timeoutSecond,
          interval,
          (milestoneId2, targetYmd2) =>
            existFunc(milestoneId2, targetYmd2).pipe(Effect.map((result) => result.exists)),
          milestoneId,
          targetYmd,
        )
      },
      retrieveMilestoneDailyList: (
        targetDateYmd: LocalDate,
      ): Effect.Effect<
        Array<Schema.Schema.Type<typeof MilestoneDailyDomainSchema>>,
        DBError | SchemaValidationError,
        GyomuRepository
      > => {
        const targetDateMonthly = targetDateYmd.substring(0, 7) as YearMonth

        return Effect.gen(function* () {
          return yield* repo.milestoneDaily
            .findByTargetDateAndMonthlyDate(targetDateYmd, targetDateMonthly)
            .pipe(Effect.flatMap((rows) => Effect.forEach(rows, toMilestoneDomain)))
        })
      },
      deleteMilestoneDaily: (
        milestoneId: string,
        targetDateYmd: LocalDate,
        isMonthly: boolean = false,
      ): Effect.Effect<number, DBError, GyomuRepository> => {
        return Effect.gen(function* () {
          return yield* repo.milestoneDaily.deleteByMilestoneIdAndTargetDate(
            milestoneId,
            targetDateYmd,
            isMonthly,
          )
        })
      },
      milestoneList: (): Effect.Effect<
        ReadonlyArray<typeof MilestoneSchema.types._select>,
        DBError,
        GyomuRepository
      > => {
        return Effect.gen(function* () {
          return yield* repo.milestone.findAll()
        })
      },
      upsertMilestoneCode: (
        milestoneId: string,
        description: string,
      ): Effect.Effect<typeof MilestoneSchema.types._select, DBError, GyomuRepository> => {
        return Effect.gen(function* () {
          const targetRecords = yield* repo.milestone.findByMilestoneId(milestoneId)
          if (targetRecords.length > 0) {
            const updated = yield* repo.milestone.updateRecords([
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              { id: targetRecords[0]!.id, milestoneId, description },
            ])
            if (!updated[0]) {
              return yield* Effect.fail(
                new DBError({
                  operation: 'update' as const,
                  message: 'Failed to update milestone code',
                  cause: undefined,
                  params: { milestoneId, description },
                  table: 'milestone',
                }),
              )
            }
            return updated[0]
          } else {
            const created = yield* repo.milestone.create([{ description, milestoneId }])
            if (!created[0]) {
              return yield* Effect.fail(
                new DBError({
                  operation: 'insert' as const,
                  message: 'Failed to create milestone code',
                  cause: undefined,
                  params: { milestoneId, description },
                  table: 'milestone',
                }),
              )
            }
            return created[0]
          }
        })
      },
      deleteMilestoneCode: (milestoneId: string): Effect.Effect<void, DBError, GyomuRepository> => {
        return Effect.gen(function* () {
          const targetRecords = yield* repo.milestone.findByMilestoneId(milestoneId)
          yield* repo.milestone.deleteRecords(targetRecords.map((r) => r.id))
        })
      },
    }
  }),
)

const toMilestoneDomain = (
  row: typeof MilestoneDailySchema.types._select,
): Effect.Effect<Schema.Schema.Type<typeof MilestoneDailyDomainSchema>, SchemaValidationError> =>
  Effect.gen(function* () {
    return {
      id: row.id,
      modifiedAt: row.modifiedAt,
      modifiedBy: row.modifiedBy,
      milestoneId: row.milestoneId,
      target:
        row.targetType === 'daily'
          ? {
              type: 'daily',
              date: yield* convertToSchemaObjectWithEffect('LocalDate')(
                LocalDateSchema,
                row.targetDate,
              ),
            }
          : {
              type: 'monthly',
              month: yield* convertToSchemaObjectWithEffect('YearMonth')(
                YearMonthSchema,
                row.targetYm,
              ),
            },
    } as Schema.Schema.Type<typeof MilestoneDailyDomainSchema>
  })
