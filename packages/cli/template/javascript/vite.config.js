import tailwindcss from '@tailwindcss/vite'
import zess from '@zess/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tailwindcss(), zess()],
  test: {
    environment: 'jsdom',
    include: ['./tests/*.test.{js,jsx}'],
  },
})
