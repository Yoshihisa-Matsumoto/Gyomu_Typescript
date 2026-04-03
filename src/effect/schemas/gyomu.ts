import { db, defineEntityCrudSchemas } from './common.js';

const appInfo = {
  fields: {
    applicationId: db.int({ max: 6000, min: 1 }),
    description: db.optionalText({ maxLength: 50 }),
    mailFromAddress: db.optionalText({ maxLength: 200 }),
    mailFromName: db.optionalText({ maxLength: 200 }),
  },
  options: {
    keyMapping: {
      applicationId: 'application_id',
      mailFromAddress: 'mail_from_address',
      mailFromName: 'mail_from_name',
    },
  },
} as const;
export const AppInfoSchema = defineEntityCrudSchemas(appInfo);

export const StatusType = defineEntityCrudSchemas({
  fields: {
    statusType: db.int({ max: 6000, min: 1 }),
    description: db.optionalText({ maxLength: 15 }),
  },
  options: {
    keyMapping: {
      statusType: 'status_type',
    },
  },
});
