import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        // three.js dominates the bundle and almost never changes, so keeping
        // it in its own chunk means an app edit does not invalidate it.
        manualChunks: (id: string) => {
          if (id.includes('node_modules/three/')) return 'three'
          if (id.includes('node_modules/react')) return 'react'
          return undefined
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
