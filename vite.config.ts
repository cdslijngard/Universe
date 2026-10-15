import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  // GitHub Pages serves the site from /Universe/, not the domain root. Only
  // production builds need it; dev stays at / so localhost:5173 still works.
  base: command === 'build' ? '/Universe/' : '/',
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
}))
