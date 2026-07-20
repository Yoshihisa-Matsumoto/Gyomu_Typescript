import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const srcRoot = 'src/pipelines'
const distRoot = 'dist/pipelines'

function copyDir(src, dest) {
  mkdirSync(dest, { recursive: true })

  for (const file of readdirSync(src)) {
    const srcPath = join(src, file)
    const destPath = join(dest, file)

    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath)
    } else if (file.endsWith('.md')) {
      copyFileSync(srcPath, destPath)
    }
  }
}

copyDir(srcRoot, distRoot)
