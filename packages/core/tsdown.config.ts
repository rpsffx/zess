import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['cjs', 'esm'],
  platform: 'neutral',
  target: 'esnext',
  clean: true,
  dts: true,
})
