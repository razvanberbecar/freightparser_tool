import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  // Force a single React instance across app + libraries (react-hook-form,
  // react-hot-toast, react-dropzone). Without pre-bundling all React
  // entrypoints together, Vite bundled a second React into react-dom, so
  // components read hooks from one React while react-dom rendered with another
  // → "Invalid hook call".
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
    ],
  },
})
