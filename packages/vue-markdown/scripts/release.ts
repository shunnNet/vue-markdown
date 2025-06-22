import { execSync } from 'node:child_process'
import { copyFileSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const rootDir = join(import.meta.dirname, '../../../')
const packageDir = join(import.meta.dirname, '../')

console.log('Building... vue-markdown')
execSync('pnpm build', { stdio: 'inherit' })

console.log('Copying README.md...')
copyFileSync(
  join(rootDir, 'README.md'),
  join(packageDir, 'README.md'),
)

const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf-8'))
const tag = packageJson.version.includes('beta')
  ? 'beta'
  : packageJson.version.includes('rc')
    ? 'rc'
    : null

execSync(`pnpm publish --access public ${tag ? `--tag ${tag}` : ''}`, {
  stdio: 'inherit',
})

rmSync(join(packageDir, 'README.md'), { force: true })
