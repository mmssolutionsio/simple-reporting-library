import { type Plugin } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { beaver } from '@multivisio/nswow/scripts/beaver.js'
import { map, mapLdd, mapJs, mapScss } from '@multivisio/nswow/scripts/build.js'
import chalk from 'chalk';

const msgBoxLength = 60

const packageName = '@multivisio/nswow'

function centerText(text: string): string {
  const padding = Math.max(0, (msgBoxLength - text.length) / 2)
  return ' '.repeat(Math.floor(padding)) + text + ' '.repeat(Math.ceil(padding))
}

function checkSrlVersion() {
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const current = pkg.dependencies?.[packageName] || pkg.devDependencies?.[packageName]
    if (!current) return

    const latest = execSync(`npm view ${packageName} version`).toString().trim()
    if (current.replace(/^[^\d]*/, '') !== latest) {

      console.log('')
      console.log(chalk.bgWhiteBright( centerText('') ))
      console.log(chalk.bgWhiteBright.redBright.bold( centerText('Attention !!!') ))
      console.log(chalk.bgWhiteBright.black.bold( centerText(`New ${packageName} version available.`) ))
      console.log(chalk.bgWhiteBright.black.bold( centerText(`Update: ${current} => ${latest}`) ))
      console.log(chalk.bgWhiteBright.black.bold( centerText(`Run: npm update -S ${packageName}`) ))
      console.log(chalk.bgWhiteBright( centerText('') ))
      console.log('')
    }
  } catch (e) {}
}

let timer: NodeJS.Timeout | null = null

function triggerAction(callback) {
  !timer || clearTimeout(timer)
  timer = setTimeout(async () => {
    await callback()
  }, 200)
}

async function startActions() {
  checkSrlVersion()
  await beaver(0)
  await map()
  await mapJs()
}

export default function viteSrlPlugin() {
  return {
    name: 'vite-srl-plugin',
    config(config) {

      startActions()

      config.base = './'

      config.resolve = config.resolve || {}
      config.resolve.alias['~'] = fileURLToPath(new URL('../..', import.meta.url))
      config.resolve.alias['@'] = fileURLToPath(new URL('../../src', import.meta.url))
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

      config.publicDir = process.env.NODE_ENV === 'development'
    },
    configureServer(server) {
      server.watcher.on('change', (path) => {
        if (path.endsWith('/srl.config.json')) {
          triggerAction(beaver)
        }
      })

      server.watcher.on('add',  (path) => {
        if (
          path.endsWith('/general.scss') ||
          path.endsWith('/app.scss') ||
          path.endsWith('/ldd.scss') ||
          path.endsWith('/pdf.scss') ||
          path.endsWith('/word.scss') ||
          path.endsWith('/xbrl.scss')
        ) {
          triggerAction(mapScss)
        }

        if (
          path.includes('livingdocs') &&
          (
            path.endsWith('/app.js') ||
            path.endsWith('/app.ts')
          )
        ) {
          triggerAction(mapJs)
        }

        if (
          path.includes('livingdocs') &&
          (
            path.endsWith('/properties.json') ||
            path.endsWith('/properties.ts') ||
            path.endsWith('/properties.js') ||
            path.endsWith('.vue')
          )
        ) {
          triggerAction(mapLdd)
        }
      })

      server.watcher.on('unlink',(path) => {
        if (
          path.endsWith('/general.scss') ||
          path.endsWith('/app.scss') ||
          path.endsWith('/ldd.scss') ||
          path.endsWith('/pdf.scss') ||
          path.endsWith('/word.scss') ||
          path.endsWith('/xbrl.scss')
        ) {
          triggerAction(mapScss)
        }

        if (
          path.includes('livingdocs') &&
          (
            path.endsWith('/app.js') ||
            path.endsWith('/app.ts')
          )
        ) {
          triggerAction(mapJs)
        }

        if (
          path.includes('livingdocs') &&
          (
            path.endsWith('/properties.json') ||
            path.endsWith('/properties.ts') ||
            path.endsWith('/properties.js') ||
            path.endsWith('.vue')
          )
        ) {
          triggerAction(mapLdd)
        }
      })
    }
  }
}