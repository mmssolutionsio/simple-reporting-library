import folders from './folders.js'
import fs from 'fs'
import { join } from 'path/posix'
import config from './config.js';

const extensions = {}
async function getExtensions() {
  if (!extensions.ext) {
    await registerExtensions()
  }
  return extensions.ext
}

async function registerExtensions() {
  extensions.ext = []
  const groupFolders = fs.readdirSync(folders.packageGroupPath);
  for (const groupFolder of groupFolders) {
    const extFolderPath = join(folders.packageGroupPath, groupFolder)
    if (extFolderPath !== folders.packagePath) {
      const packageName = `${config.packageNamespace}/${groupFolder}`
      const i = await import(packageName);
      extensions.ext.push({
        name: groupFolder,
        package: {
          name: packageName,
          path: extFolderPath,
        },
        ...i
      })
    }
  }
  return extensions
}

export default extensions.ext
export { getExtensions, registerExtensions, extensions }