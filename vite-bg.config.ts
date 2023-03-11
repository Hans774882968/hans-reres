import { defineConfig } from 'vite';
import { resolve } from 'path';
import pkg from './package.json';

const destName = `chrome-plugin-hans-reres-v${pkg.version}`;
const backgroundTsPath = resolve('src', 'background', 'background.ts');

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: [
        backgroundTsPath
      ],
      output: {
        assetFileNames: '[name].[hash].[ext]',
        chunkFileNames: '[name].[hash].js',
        dir: destName,
        entryFileNames: '[name].js'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
