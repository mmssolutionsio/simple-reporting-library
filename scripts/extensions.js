import folders from './folders.js'
import fs from 'fs'
import { join } from 'path/posix'

const extensions = {}
async function getExtensions() {
  if (!extensions.ext) {
    await registerExtensions()
  }
  return extensions.ext
}

async function registerExtensions() {
  extensions.ext = []
  const groupFolders = fs.readdirSync(extensions.group);
  const groupName = extensions.group.split('/').pop()
  for (const groupFolder of groupFolders) {
    const extFolderPath = join(extensions.group, groupFolder)
    if (extFolderPath !== folders.packagePath) {
      const packageName = `${groupName}/${groupFolder}`
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