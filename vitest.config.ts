import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    environment: 'jsdom',
  },
})