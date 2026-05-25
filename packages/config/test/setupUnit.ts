import { tmpdir } from 'node:os'
import { initLogger } from '@gyomu/infra'

await initLogger({
  fixedLogFilename: false,
  logLevel: 'debug',
  logPath: tmpdir(),
  logFilename: undefined,
})
