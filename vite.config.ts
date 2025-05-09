// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/tank2tank/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@babylonjs/core/')) {
            return 'vendor-babylonjs-core';
          }
          // Keep @babylonjs/havok separate if it's large, or bundle with core if preferred
          if (id.includes('node_modules/@babylonjs/havok/')) {
             return 'vendor-babylonjs-havok';
          }
          if (id.includes('node_modules/@babylonjs/gui/')) {
            return 'vendor-babylonjs-gui';
          }
          if (id.includes('node_modules/@babylonjs/loaders/')) {
            return 'vendor-babylonjs-loaders';
          }
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
        }
      }
    }
  },
  // Add server and esbuild configurations
  server: {

  },
  esbuild: {
    supported: {
        'top-level-await': true
    }
  },
  // Ensure optimizeDeps includes @babylonjs/havok if issues persist with its own dependencies
  // optimizeDeps: {
  //   include: ['@babylonjs/havok'],
  // }
})