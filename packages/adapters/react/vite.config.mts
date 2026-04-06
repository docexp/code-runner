/// <reference types='vitest' />
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import * as path from 'path';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../../node_modules/.vite/packages/react',
  plugins: [
    tailwindcss(),
    react(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.lib.json'),
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [],
  // },
  // Configuration for building your library.
  // See: https://vite.dev/guide/build.html#library-mode
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      // Could also be a dictionary or array of multiple entry points.
      entry: 'src/index.ts',
      name: 'react',
      fileName: 'index',
      // Change this to the formats you want to support.
      // Don't forget to update your package.json as well.
      formats: ['es' as const],
    },
    rollupOptions: {
      // External packages that should not be bundled into your library.
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.includes('index.css')) return 'style.css';
          return '[name][extname]';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    setupFiles: ['src/test-setup.ts'],
  },
}));
