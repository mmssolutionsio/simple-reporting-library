import { Plugin } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default function viteSrlPlugin(): Plugin {
  return {
    name: 'vite-srl-plugin',
    config(config) {
      config.resolve = config.resolve || {}
      config.resolve.alias['~'] = fileURLToPath(new URL('../..', import.meta.url))
      config.resolve.alias['#components'] = fileURLToPath(new URL('../components', import.meta.url))
      config.resolve.alias['#composables'] = fileURLToPath(new URL('../composables', import.meta.url))
      config.resolve.alias['#plugins'] = fileURLToPath(new URL('../plugins', import.meta.url))
      config.resolve.alias['#types'] = fileURLToPath(new URL('../types', import.meta.url))
      config.resolve.alias['#utils'] = fileURLToPath(new URL('../utils', import.meta.url))
      config.resolve.alias['#imports'] = fileURLToPath(new URL('../imports', import.meta.url))
      config.resolve.alias['#ld'] = fileURLToPath(new URL('../..//livingdocs', import.meta.url))
      config.resolve.alias['assets'] = fileURLToPath(new URL('../../src/assets', import.meta.url))
      config.resolve.alias['srl'] = fileURLToPath(new URL('../srl', import.meta.url))
      config.resolve.alias['vue'] = 'vue/dist/vue.esm-bundler.js'
    }
  }
}