import { tmpdir } from 'node:os'
import { initLogger } from '../src/logger/pinoLogger'

await initLogger({
  fixedLogFilename: false,
  logLevel: 'debug',
  logPath: tmpdir(),
  logFilename: undefined,
})
