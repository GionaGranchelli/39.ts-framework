import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['html', 'json', 'text']
    },
    exclude: ['dist', 'node_modules'],
  },
  resolve: {
    alias: {
      '39.ts': resolve(__dirname, '../39.ts/index.ts'),
      '39.ts-neutralino': resolve(__dirname, './index.ts')
    }
  }
});
