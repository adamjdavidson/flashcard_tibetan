import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Exclude API directory from build (handled separately by Vercel)
    rollupOptions: {
      external: (id) => id.includes('/api/')
    }
  },
  // Don't process files in API directory
  publicDir: 'public',
  server: {
    fs: {
      // Allow serving files from API directory
      strict: false
    }
  }
})
