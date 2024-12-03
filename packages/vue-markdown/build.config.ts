import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  // If entries is not provided, will be automatically inferred from package.json
  entries: [
    // default
    './src/index',
  ],

  // Change outDir, default is 'dist'
  outDir: 'dist',
  rollup: {
    emitCJS: true,
    commonjs: {
      // https://github.com/unjs/unbuild/issues/417
      // ".d.ts" is included in cjs build currently, causing unexpected token error
      // so we need to exclude it
      exclude: ['**/@types/**/*.d.ts'],
    },
  },
  // externals: ['hast', 'unist'],

  // Generates .d.ts declaration file
  declaration: true,

  failOnWarn: false,
})
