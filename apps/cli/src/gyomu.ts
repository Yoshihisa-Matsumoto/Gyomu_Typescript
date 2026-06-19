import cac from 'cac'
import { askCommand } from './commands/ask.js'
import { snapshotCommand } from './commands/snapshot.js'

const cli = cac('gyomu')

cli.command('ask <projectRootPath> <file> ').action(askCommand)

cli.command('snapshot <projectName>').action(snapshotCommand)

cli.help()
const parsed = cli.parse()

console.log(parsed)
