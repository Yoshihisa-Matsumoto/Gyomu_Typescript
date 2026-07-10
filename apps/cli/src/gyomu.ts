import 'dotenv/config'
import cac from 'cac'
import { askCommand } from './commands/ask.js'
import { snapshotCommand } from './commands/snapshot.js'

// console.log(process.env)
const cli = cac('gyomu')

cli.command('ask <projectRootPath> <file> ').action(askCommand)

cli
  .command('snapshot <projectName>')
  .option('-t, --buildTsDoc', 'Build TSDoc')
  .option('--filter <filePath>', 'TsDoc Filter')
  .option('--commit', 'Commit')
  .option('--recommit', 'Remove Snapshot and Commit all files')
  .option('--loggingKeyword <keyword>', 'Specify logging keyword in the symbol')
  .action(snapshotCommand)

cli.help()
const parsed = cli.parse()

console.log(parsed)
