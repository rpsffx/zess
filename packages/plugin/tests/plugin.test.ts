import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer, type ViteDevServer } from 'vite'
import { describe, expect, it } from 'vitest'
import zess from '../src/plugin'
import type { RawSourceMap } from '@zessjs/compiler'

function createTestServer(): Promise<ViteDevServer> {
  return createServer({
    root: resolve(__dirname, 'fixtures'),
    plugins: [zess()],
    resolve: {
      alias: {
        '@zessjs/core': resolve(__dirname, '../../core/src/index.ts'),
      },
    },
  })
}

describe('zess', () => {
  it('should transform tsx file correctly', async () => {
    const server = await createTestServer()
    const result = await server.transformRequest('./main.tsx')
    expect(result?.code).toContain('_$createElement')
    expect(result?.code).toContain('useSignal')
    expect(result?.map).toBeDefined()
  })
  it('should generate correct sourcemap', async () => {
    const server = await createTestServer()
    const result = await server.transformRequest('./main.tsx')
    const sourcemap = result!.map as RawSourceMap
    expect(sourcemap.sources).toContain('main.tsx')
    expect(sourcemap.sourcesContent!.join('')).toContain('useSignal')
  })
  it('should report error with correct source location', async () => {
    const mainTsxPath = resolve(__dirname, 'fixtures/main.tsx')
    const originalCode = await readFile(mainTsxPath, 'utf8')
    const brokenCode = originalCode.replace('</button>', '</buton')
    await writeFile(mainTsxPath, brokenCode, 'utf8')
    const server = await createTestServer()
    try {
      await server.transformRequest('./main.tsx')
    } catch (error) {
      const { message, loc } = error as any
      const errorLine = brokenCode.split('\n')[loc.line - 1]
      expect(message).toContain('Unexpected closing "buton" tag')
      expect(loc).toMatchObject({
        line: 10,
        column: 6,
        file: expect.stringContaining('main.tsx'),
      })
      expect(errorLine.trim()).toContain('</buton')
      expect(errorLine.length).toBeGreaterThan(loc.column)
    } finally {
      await writeFile(mainTsxPath, originalCode, 'utf8')
    }
  })
})
