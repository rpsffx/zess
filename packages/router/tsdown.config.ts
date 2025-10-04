import zess from '@zessjs/vite-plugin'
import { defineConfig, type UserConfig } from 'tsdown'

const configs: UserConfig[] = [
  defineConfig({
    entry: ['./src/router.tsx'],
    format: ['cjs', 'esm'],
    platform: 'neutral',
    plugins: [zess()],
    clean: true,
    dts: true,
  }),
  defineConfig({
    entry: ['./src/router.tsx'],
    format: 'esm',
    inputOptions: {
      jsx: 'preserve',
    },
    outExtensions: () => ({
      js: '.jsx',
    }),
    clean: true,
    silent: true,
  }),
]

export default configs
