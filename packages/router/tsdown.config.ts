import { compile } from '@zess/compiler'
import { defineConfig } from 'tsdown'

export default [
  defineConfig({
    entry: ['./src/router.tsx'],
    format: 'esm',
    inputOptions: {
      jsx: 'preserve',
    },
    outputOptions: {
      entryFileNames: 'router.jsx',
    },
    clean: true,
    dts: true,
  }),
  defineConfig({
    entry: ['./src/router.tsx'],
    format: 'esm',
    platform: 'neutral',
    inputOptions: {
      jsx: 'preserve',
    },
    plugins: {
      name: 'zess',
      renderChunk(code) {
        return compile(code)
      },
    },
    clean: true,
    dts: true,
  }),
]
