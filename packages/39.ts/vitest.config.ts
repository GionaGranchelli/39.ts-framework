/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import * as path from 'path';
import { resolve } from 'path';

export default defineConfig({
  root: path.resolve(__dirname),
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    include: [
      'core/**/*.test.{ts,js}',
      'dom/**/*.test.{ts,js}',
      'components/**/*.test.{ts,js}',
      'storage/**/*.test.{ts,js}',
      '**/*.test.ts'
    ],
    exclude: ['dist', 'node_modules'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/'
      ]
    },
  },
  resolve: {
    alias: {
      // Use the compiled output with proper ESM resolution
      '39.ts': resolve(__dirname, './dist/index.js'),
    }
  },
  esbuild: {
    // Ensure proper ESM handling
    target: 'node18',
    format: 'esm'
  }
});