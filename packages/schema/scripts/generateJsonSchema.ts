import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { Schema } from 'effect'

import { Development, Package, Roadmap, Technical } from '../src/schemas/knowledge/index.js'

const outputDir = join(import.meta.dirname, '../../..', 'schemas')

mkdirSync(outputDir, { recursive: true })

const schemas = {
  Package: Package,
  Technical: Technical,
  Development: Development,
  Roadmap: Roadmap,
}

for (const [name, schema] of Object.entries(schemas)) {
  const jsonSchema = Schema.toStandardSchemaV1(Schema.toStandardJSONSchemaV1(schema))

  writeFileSync(
    join(outputDir, `${name}.json`),
    JSON.stringify(jsonSchema['~standard'].jsonSchema.output({ target: 'draft-2020-12' }), null, 2),
  )

  console.log(`Generated ${name}.json`)
}
