/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // Test reporting
    reporters: process.env.CI ? ['verbose', 'junit'] : ['verbose'],
    outputFile: process.env.CI ? '../test-results/app-junit.xml' : undefined,
    include: [
      'src/**/__tests__/**/*.+(ts|tsx|js)',
      'src/**/*.(test|spec).+(ts|tsx|js)',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/setup-tests.ts',
        'node_modules/',
      ],
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100,
        },
      },
    },
  },
  resolve: {
    alias: {
      'shared/src': path.resolve(__dirname, '../shared/src'),
    },
  },
});
