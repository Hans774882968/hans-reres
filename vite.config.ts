import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import viteEslint from 'vite-plugin-eslint';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import transformManifestPlugin from './plugins/transform-manifest-plugin';

const destName = `chrome-plugin-hans-reres-v${pkg.version}`;

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  plugins: [
    react(),
    viteEslint({
      failOnError: false
    }),
    transformManifestPlugin({
      dest: destName, manifestPath: 'manifest-pre.json'
    }),
    copy({
      targets: [
        { src: 'src/assets', dest: destName }
      ],
      hook: 'writeBundle'
    })
  ],
  build: {
    rollupOptions: {
      input: [
        'popup.html',
        'options.html'
      ],
      output: {
        chunkFileNames: '[name].[hash].js',
        assetFileNames: '[name].[hash].[ext]',
        entryFileNames: '[name].js',
        dir: destName
      }
    }
  }
});
