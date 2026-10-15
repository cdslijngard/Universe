import { defineConfig } from 'vitest/config'

// A separate config from vite.config.ts on purpose: the suite covers the pure
// maths and the datasets only, so it needs none of the app's plugins.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
