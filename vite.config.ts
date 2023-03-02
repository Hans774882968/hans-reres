import { defineConfig } from 'vite';
import { resolve } from 'path';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import react from '@vitejs/plugin-react';
import transformManifestPlugin from './plugins/transform-manifest-plugin';
import viteEslint from 'vite-plugin-eslint';

const destName = `chrome-plugin-hans-reres-v${pkg.version}`;

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: [
        'popup.html',
        'options.html'
      ],
      output: {
        assetFileNames: '[name].[hash].[ext]',
        chunkFileNames: '[name].[hash].js',
        dir: destName,
        entryFileNames: '[name].js'
      }
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
      hook: 'writeBundle',
      targets: [
        { dest: destName, src: 'src/assets' }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
