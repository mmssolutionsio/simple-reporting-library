import folders from './folders.js';
import fs from 'fs';

async function prepare() {
  if (fs.existsSync(folders.srlRoot)) {
    await fs.rmSync(folders.srlRoot, { recursive: true, force: true });
  }
  await fs.cpSync(folders.packageSrl, folders.srlRoot, { recursive: true });
}

export default prepare;
