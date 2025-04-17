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
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      nswow: fileURLToPath(new URL('./nswow', import.meta.url))
    }
  },
  publicDir: process.env.NODE_ENV === 'development'
})
