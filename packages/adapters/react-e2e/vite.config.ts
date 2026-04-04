import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: import.meta.dirname,
  resolve: {
    // resolve @cheetah-coder/* to TypeScript source for fast iteration
    conditions: ['@cheetah-coder/source', 'import', 'module', 'browser', 'default'],
  },
  plugins: [react()],
  server: {
    port: 5174,
  },
});
