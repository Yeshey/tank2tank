import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// Remove unused import: import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/tank2tank/',
  build: {
    rollupOptions: {
      output: {
        // Remove unused getModuleInfo from function parameters
        manualChunks(id /*, { getModuleInfo } */) { // Comment out or remove getModuleInfo
          if (id.includes('node_modules/three/')) {
            return 'vendor-three';
          }
          if (id.includes('node_modules/@dimforge/rapier3d-compat/')) {
              return 'vendor-rapier';
          }
          // Add other rules if needed
        }
      }
    }
  }
})