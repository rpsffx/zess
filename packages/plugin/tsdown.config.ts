import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/plugin.ts'],
  format: ['cjs', 'esm'],
  target: 'node18.0',
  clean: true,
  dts: true,
})
