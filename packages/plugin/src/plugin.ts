import process from 'node:process'
import { compile } from '@zessjs/compiler'
import {
  createFilter,
  transformWithEsbuild,
  type FilterPattern,
  type Plugin,
} from 'vite'

const isTypeScriptFile = RegExp.prototype.test.bind(/\.[mc]?tsx?$/)

export default function zess(
  options: {
    include?: FilterPattern
    exclude?: FilterPattern
    modulePath?: string
  } = {},
): Plugin {
  const filter = createFilter(
    options.include ?? ['**/*.{tsx,jsx}'],
    options.exclude ?? ['{build,dist,public}/**'],
  )
  return {
    name: 'zess',
    enforce: 'pre',
    config: () => ({
      resolve: {
        conditions: ['zess'],
      },
      optimizeDeps: {
        force: true,
        include: ['@zessjs/core'],
        exclude: ['@zessjs/router'],
      },
    }),
    async transform(code, id) {
      if (!filter(id)) return
      let sourcemap = this.getCombinedSourcemap()
      if (isTypeScriptFile(id)) {
        const transformed = await transformWithEsbuild(
          code,
          id,
          {
            jsx: 'preserve',
          },
          sourcemap,
        )
        code = transformed.code
        sourcemap = transformed.map
      }
      return compile(code, {
        file: id,
        sourcemap,
        sourceRoot: process.cwd(),
        modulePath: options.modulePath ?? '@zessjs/core',
      })
    },
  }
}
