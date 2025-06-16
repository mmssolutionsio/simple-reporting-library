import * as folders from '../srl/plugins/folders.js'
import fs from 'fs'
import path from 'path'

console.log(folders)

if (fs.existsSync(folders.srlRoot)) {
  fs.rmSync(folders.srlRoot, { recursive: true, force: true })
}
fs.cpSync(folders.packageSrl, folders.srlRoot, {recursive: true})

const tsConfigIncludes = [
  ".srl/**/*",
  ".srl/**/*.d.ts",
  ".srl/**/*.vue",
  "livingdocs/**/*",
  "livingdocs/**/*.vue",
]

const tsConfigPaths = {
  "@/*": ["./src/*"],
  "~/*": ["./*"],
  "#srl": ["./.srl"],
  "#srl/*": ["./.srl/*"],
  "#components": ["./.srl/components"],
  "#components/*": ["./.srl/components/*"],
  "#composables": ["./.srl/composables"],
  "#composables/*": ["./.srl/composables/*"],
  "#utils": ["./.srl/utils"],
  "#utils/*": ["./.srl/utils/*"],
  "#plugins": ["./.srl/plugins"],
  "#plugins/*": ["./.srl/plugins/*"],
  "#types": ["./.srl/types"],
  "#types/*": ["./.srl/types/*"],
  "#imports": ["./.srl/imports"],
  "#imports/*": ["./.srl/imports/*"],
  "#ld": ["./livingdocs"],
  "#ld/*": ["./livingdocs/*"],
  "assets": ["./src/assets"],
  "assets/*": ["./src/assets/*"],
  "srl": ["./.srl/srl"],
  "srl/*": ["./.srl/srl/*"]
}

const appTsConfigPath = path.join(folders.root, 'tsconfig.app.json')
const appTsConfig = JSON.parse(fs.readFileSync(appTsConfigPath, 'utf-8'))

const mergedIncludes = [
  ...(appTsConfig.include || []),
  ...tsConfigIncludes.filter(i => !(appTsConfig.include || []).includes(i))
]
appTsConfig.include = mergedIncludes

const mergedPaths = {
  ...(appTsConfig.compilerOptions?.paths || {}),
  ...tsConfigPaths
}
appTsConfig.compilerOptions.paths = mergedPaths

fs.writeFileSync(appTsConfigPath, JSON.stringify(appTsConfig, null, 2))

console.log(path.join( folders.ld, '**', 'properties.{json,js,ts}' ))