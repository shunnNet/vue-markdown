import { execSync } from 'node:child_process'

execSync('pnpm --filter @crazydos/vue-markdown release', { stdio: 'inherit' })
