import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['@rollup/rollup-linux-x64-gnu'],
  },
  build: {
    outDir: 'dist',
  },
  resolve: {
    // No aliases needed
  },

  base: '/'
})
