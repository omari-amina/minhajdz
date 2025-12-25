
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Custom plugin to copy PWA files to dist
const copyPwaFiles = () => {
  return {
    name: 'copy-pwa-files',
    closeBundle: async () => {
      const files = ['sw.js', 'manifest.json'];
      files.forEach(file => {
        if (fs.existsSync(file)) {
          fs.copyFileSync(file, resolve('dist', file));
        }
      });
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react(), copyPwaFiles()],
    server: {
      port: 5173,
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    // Define process.env to make API_KEY available in the browser
    define: {
      // Use fallback to empty string to avoid "process is not defined" error in browser if key is missing
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env': {} // Fallback for other process.env calls
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [],
    }
  };
});
