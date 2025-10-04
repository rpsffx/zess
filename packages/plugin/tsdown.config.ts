import { defineConfig, type UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
  entry: ['./src/plugin.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
})

export default config
