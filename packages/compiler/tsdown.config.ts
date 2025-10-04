import { defineConfig, type UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/compiler.ts'],
  format: ['cjs', 'esm'],
  platform: 'neutral',
  target: 'esnext',
  clean: true,
  dts: true,
})

export default config
