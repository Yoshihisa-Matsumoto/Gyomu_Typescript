import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const srcRoot = 'src/features'
const distRoot = 'dist/features'

function copyDir(src: string, dest: string) {
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
