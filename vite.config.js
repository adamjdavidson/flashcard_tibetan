import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
    // @breezystack/lamejs is already ES module compatible, so we don't need
    // the CommonJS plugin anymore. The internal dependencies are properly exported.
  ],
  build: {
    // Exclude API directory from build (handled separately by Vercel)
    rollupOptions: {
      external: (id) => id.includes('/api/')
    }
  },
  // Pre-bundle @breezystack/lamejs during dev for faster startup
  optimizeDeps: {
    include: ['@breezystack/lamejs']
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
