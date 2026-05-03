import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const bakerEntry = fileURLToPath(new URL('../svg-icon-baker/src/index.ts', import.meta.url))

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    projects: [
      {
        resolve: {
          alias: {
            'svg-icon-baker': bakerEntry,
          },
        },
        test: {
          name: 'unit',
          globals: true,
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        resolve: {
          alias: {
            'svg-icon-baker': bakerEntry,
          },
        },
        test: {
          name: 'browser',
          globals: true,
          environment: 'node',
          include: ['test/browser/**/*.spec.ts'],
          testTimeout: 30000,
          hookTimeout: 30000,
        },
      },
    ],
  },
})
