import cac from 'cac'
import { askCommand } from './commands/ask.js'

const cli = cac('gyomu')

cli.command('ask <projectRootPath> <file> ').action(askCommand)

cli.help()
const parsed = cli.parse()

console.log(parsed)
