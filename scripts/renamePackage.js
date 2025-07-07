import fs from 'fs';
import path from 'path';

const search = '@multivisio/nswow';
const replace = '@simple-report/base';
const CWD = process.cwd();
const excludes = [
  'scripts/renamePackage.js',
  'scripts/renamePackage.d.ts',
  '.git',
  'node_modules',
  'test-data',
];

const excludePaths = [...excludes.map((f) => path.join(CWD, ...f.split('/')))];

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(search)) {
    const newContent = content.split(search).join(replace);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Replaced in: ${filePath}`);
  }
}

function walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (excludePaths.includes(fullPath)) continue;
    if (entry.isDirectory()) {
      console.log(fullPath);
      walkDir(fullPath);
    } else if (entry.isFile()) {
      console.log(fullPath);
      replaceInFile(fullPath);
    }
  }
}

export function renamePackages(startDir = process.cwd()) {
  console.log(`Starting to rename packages from "${search}" to "${replace}"`);
  walkDir(startDir);
  console.log('Done!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  renamePackages();
}
