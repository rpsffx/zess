import process from 'node:process'
import { compile } from '@zessjs/compiler'
import { createFilter, type FilterPattern, type Plugin } from 'vite'

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
    config: () => ({
      esbuild: {
        jsx: 'preserve',
      },
      resolve: {
        conditions: ['zess'],
      },
      optimizeDeps: {
        esbuildOptions: {
          jsx: 'preserve',
        },
        force: true,
        include: ['@zessjs/core'],
        exclude: ['@zessjs/router'],
      },
    }),
    transform(code, id) {
      if (!filter(id)) return
      return compile(code, {
        file: id,
        sourceRoot: process.cwd(),
        sourcemap: this.getCombinedSourcemap(),
        modulePath: options.modulePath ?? '@zessjs/core',
      })
    },
  }
}
