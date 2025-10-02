/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import zess from '@zessjs/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), zess()],
  test: {
    environment: 'jsdom',
    include: ['./tests/*.test.{ts,tsx}'],
  },
})
