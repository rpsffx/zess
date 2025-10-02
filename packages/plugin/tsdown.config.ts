import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/plugin.ts'],
  format: ['cjs', 'esm'],
  clean: true,
  dts: true,
})
