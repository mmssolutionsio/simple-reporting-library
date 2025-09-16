import folders from './folders.js';
import fs from 'fs';
import path from 'path/posix';

const tsConfigIncludes = [
  '.srl/**/*',
  '.srl/**/*.d.ts',
  '.srl/**/*.vue',
  'livingdocs/**/*',
  'livingdocs/**/*.vue',
];

const tsConfigPaths = {
  '@/*': ['./src/*'],
  '~/*': ['./*'],
  '#srl': ['./.srl'],
  '#srl/*': ['./.srl/*'],
  '#components': ['./.srl/components'],
  '#components/*': ['./.srl/components/*'],
  '#composables': ['./.srl/composables'],
  '#composables/*': ['./.srl/composables/*'],
  '#utils': ['./.srl/utils'],
  '#utils/*': ['./.srl/utils/*'],
  '#plugins': ['./.srl/plugins'],
  '#plugins/*': ['./.srl/plugins/*'],
  '#types': ['./.srl/types'],
  '#types/*': ['./.srl/types/*'],
  '#imports': ['./.srl/imports'],
  '#imports/*': ['./.srl/imports/*'],
  '#ld': ['./livingdocs'],
  '#ld/*': ['./livingdocs/*'],
  assets: ['./src/assets'],
  'assets/*': ['./src/assets/*'],
  srl: ['./.srl/srl'],
  'srl/*': ['./.srl/srl/*'],
};

function prepare() {
  if (fs.existsSync(folders.srlRoot)) {
    fs.rmSync(folders.srlRoot, { recursive: true, force: true });
  }
  fs.cpSync(folders.packageSrl, folders.srlRoot, { recursive: true });

  /*
  const tsConfigPath = path.join(folders.root, 'tsconfig.app.json');
  if (fs.existsSync(tsConfigPath)) {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf-8'));

    const mergedIncludes = [
      ...(tsConfig.include || []),
      ...tsConfigIncludes.filter((i) => !(tsConfig.include || []).includes(i)),
    ];
    tsConfig.include = tsConfig.include || [];
    tsConfig.include = mergedIncludes;

    const mergedPaths = {
      ...(tsConfig.compilerOptions?.paths || {}),
      ...tsConfigPaths,
    };
    tsConfig.compilerOptions = tsConfig.compilerOptions || {};
    tsConfig.compilerOptions.paths = mergedPaths;

    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
  }
   */
}

export default prepare;
