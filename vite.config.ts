import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import viteEslint from 'vite-plugin-eslint';
import copy from 'rollup-plugin-copy';
import pkg from './package.json';
import transformManifestPlugin from './plugins/transform-manifest-plugin';
// TODO：尝试用iife将background.ts的esm转为单个文件
// import iife from 'rollup-plugin-copy'

const destName = `chrome-plugin-hans-reres-v${pkg.version}`;
const backgroundTsPath = resolve('src', 'background', 'background.ts');

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
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
    // iife()
  ],
  build: {
    rollupOptions: {
      input: [
        'popup.html',
        'options.html',
        backgroundTsPath
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
