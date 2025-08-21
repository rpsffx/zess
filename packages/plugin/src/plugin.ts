import process from 'node:process'
import { compile } from '@zess/compiler'
import { createFilter, type FilterPattern, type Plugin } from 'vite'

export default function zess(
  options: {
    include?: FilterPattern
    exclude?: FilterPattern
    modulePath?: string
    rolldown?: boolean
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
        include: ['@zess/core'],
        exclude: ['@zess/router'],
      },
    }),
    transform(code, id) {
      if (!filter(id)) return
      return compile(code, {
        file: id,
        sourceRoot: process.cwd(),
        sourcemap: this.getCombinedSourcemap(),
        modulePath: options.modulePath ?? '@zess/core',
      })
    },
  }
}
