import { globSync } from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const targetPkg = process.argv[2] ?? ''

const packages = globSync('packages/*')

for (const pkg of packages) {
  if (targetPkg) {
    const computedPackageName = path.join('packages', targetPkg)
    if (pkg != computedPackageName) {
      console.log(`ignore: ${computedPackageName} vs ${pkg}`)
      continue
    }
  }

  const entry = pkg.replaceAll('\\', '/')
  const out = path.join(pkg, 'docs/api').replaceAll('\\', '/')
  console.log(`will execute under ${pkg}`)
  execSync(`typedoc --entryPoints ${entry} --out ${out}`, { stdio: 'inherit' })
}
