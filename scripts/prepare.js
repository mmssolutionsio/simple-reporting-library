import folders from './folders.js';
import fs from 'fs';
import { join } from 'path/posix';
import { getExtensions } from './extensions.js';

const toPascalCase = str =>
  str
    .split(/[-_]/)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');

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

  const extensions = await getExtensions();
  const extImports = [];
  const extConfigs = [];

  for (const ext of extensions) {
    extImports.push(`import * as ${ext.name} from '${ext.package.name}';`);
    extConfigs.push(
      `{ ` +
      `name: '${ext.name}', ` +
      `package: { ` +
      `name: '${ext.package.name}', ` +
      `path: '${ext.package.path}', ` +
      `}, ` +
      `...${ext.name} ` +
      `}`
    );

    const componentsPath = join(ext.package.path, 'components');
    if (fs.existsSync(componentsPath)) {
      const componentTarget = join(folders.srlComponents, 'Srl', toPascalCase(ext.name));
      fs.cpSync(componentsPath, componentTarget, { recursive: true });
    }
  }

  const extensionsFileContent = `${extImports.join('\n')}` + `\n` +
    `export const extensions = [\n  ${extConfigs.join(',\n  ')}\n];\n` +
    `export default extensions;\n`;

  fs.writeFileSync(join(folders.srlRoot, 'extensions.js'), extensionsFileContent);

  const srlIgnoreContent = [];
  for (const srlIgnoreFile of srlIgnoresFiles) {
    srlIgnoreContent.push(`/${srlIgnoreFile.name}`);
  }

  fs.writeFileSync(join(folders.root, 'srl', '.gitignore'), srlIgnoreContent.join('\n'));

  for (const e of extensions) {
    if (e.prepare) {
      await e.prepare();
    }
  }

}

export default prepare;
