import folders from './folders.js';
import fs from 'fs';
import { join } from 'path/posix';

async function prepare() {
  if (fs.existsSync(folders.srlRoot)) {
    await fs.rmSync(folders.srlRoot, { recursive: true, force: true });
  }
  const srlFolders = fs.readdirSync(folders.packageSrl, { withFileTypes: true });
  for (const srlFolder of srlFolders) {
    const srcPath = join(folders.packageSrl, srlFolder.name);
    const destPath = join(folders.root, srlFolder.name);
    fs.cpSync(srcPath, destPath, { recursive: true });
  }
  const srlIgnoresFiles = fs.readdirSync(join(folders.packageSrl, 'srl'), { withFileTypes: true });
  const srlIgnoreContent = [];
  for (const srlIgnoreFile of srlIgnoresFiles) {
    srlIgnoreContent.push(`/${srlIgnoreFile.name}`);
  }
  fs.writeFileSync(join(folders.root, 'srl', '.gitignore'), srlIgnoreContent.join('\n'));
}

export default prepare;
