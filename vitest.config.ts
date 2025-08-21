import { resolve } from 'node:path'
import zess from '@zess/vite-plugin'
import { defineConfig, type ViteUserConfig } from 'vitest/config'

const config: ViteUserConfig = defineConfig({
  test: {
    pool: 'threads',
    coverage: {
      provider: 'istanbul',
      include: ['packages/*/src/*.{ts,tsx}'],
      reporter: ['text', 'json', 'html'],
    },
    projects: [
      {
        test: {
          name: 'compiler',
          root: './packages/compiler',
          environment: 'node',
          include: ['./tests/*.test.ts'],
        },
      },
      {
        plugins: [zess({ modulePath: '../src/dom' })],
        test: {
          name: 'core',
          root: './packages/core',
          include: ['./tests/*.test.{ts,tsx}'],
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        test: {
          name: 'plugin',
          root: './packages/plugin',
          environment: 'node',
          include: ['./tests/*.test.ts'],
          alias: {
            '@zess/compiler': resolve(
              __dirname,
              './packages/compiler/src/compiler.ts',
            ),
          },
        },
      },
      {
        plugins: [zess()],
        test: {
          name: 'router',
          root: './packages/router',
          include: ['./tests/*.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            provider: 'playwright',
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
})

export default config
