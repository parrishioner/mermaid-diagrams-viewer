import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: '../app/build/custom-ui',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      shared: path.resolve(__dirname, '../shared'),
    },
  },
});
