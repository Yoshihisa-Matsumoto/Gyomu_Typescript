import { ImportedBaseClass } from './shared.js'
import type { ImportedInterface } from './shared.js'

class LocalBaseClass {}
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LocalInterface {}

export class HeritageClass extends ImportedBaseClass implements ImportedInterface, LocalInterface {}

export class LocalHeritageClass extends LocalBaseClass implements LocalInterface {}
