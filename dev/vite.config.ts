import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'
import { fileURLToPath, URL } from 'node:url'
import { beaver } from '@multivisio/nswow/scripts/beaver.js'
import { map, mapJs } from '@multivisio/nswow/scripts/build.js'
import { nswowWatcher } from '@multivisio/nswow/scripts/vite.js'

await beaver()
await map()
await mapJs()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VueDevTools(), nswowWatcher()],
  base: './',
  build: {
    outDir: './.output/app'
  },
  resolve: {
    alias: {
      '#srl': '@multivisio/nswow/src',
      '#components': '@multivisio/nswow/src/components',
      '#composables': '@multivisio/nswow/src/composables',
      '#plugins': '@multivisio/nswow/src/plugins',
      '#types': '@multivisio/nswow/src/types',
      '#imports': fileURLToPath(new URL('./.nswow', import.meta.url)),
      '~': fileURLToPath(new URL('.', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '#ld': fileURLToPath(new URL('./livingdocs', import.meta.url)),
      assets: fileURLToPath(new URL('./src/assets', import.meta.url)),
      nswow: fileURLToPath(new URL('./nswow', import.meta.url)),
      srl: fileURLToPath(new URL('./nswow', import.meta.url)),
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  publicDir: process.env.NODE_ENV === 'development'
})
